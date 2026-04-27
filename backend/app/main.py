import os
import uuid
from collections import Counter
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx

from app.schemas import (
    AllocationCreate,
    AllocationRecord,
    ChatHistoryMessage,
    ChatHistoryResponse,
    ChatRequest,
    ChatResponse,
    DashboardDataResponse,
    DashboardStats,
    IncidentCreate,
    IncidentRecord,
    LiveIntelligenceResponse,
    MetricBar,
    ModelInferenceRequest,
    ModelInferenceResponse,
    NasaEventSummary,
    RequestCreate,
    RequestRecord,
    ResourceCreate,
    ResourceRecord,
)
from app.services.emergency_automation import process_emergency_message
from app.services.huggingface_client import HuggingFaceClientError, get_huggingface_client
from app.services.mistral_client import MistralClientError, get_mistral_client
from app.services.supabase_store import get_supabase_store

load_dotenv()

app = FastAPI(title="Disaster Response Chat API", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/models/incident-severity", response_model=ModelInferenceResponse)
async def infer_incident_severity(payload: ModelInferenceRequest) -> ModelInferenceResponse:
    try:
        client = get_huggingface_client()
        result = await client.classify(
            payload.text,
            ["Critical", "High", "Medium", "Low"],
        )
    except HuggingFaceClientError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ModelInferenceResponse(
        label=str(result["label"]),
        score=float(result["score"]),
        labels=[str(item) for item in result["labels"]],
        scores=[float(item) for item in result["scores"]],
    )


@app.post("/api/models/request-priority", response_model=ModelInferenceResponse)
async def infer_request_priority(payload: ModelInferenceRequest) -> ModelInferenceResponse:
    try:
        client = get_huggingface_client()
        result = await client.classify(
            payload.text,
            ["Critical", "High", "Medium", "Low"],
        )
    except HuggingFaceClientError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ModelInferenceResponse(
        label=str(result["label"]),
        score=float(result["score"]),
        labels=[str(item) for item in result["labels"]],
        scores=[float(item) for item in result["scores"]],
    )


def _require_store():
    store = get_supabase_store()
    if store is None:
        raise HTTPException(status_code=500, detail="Supabase configuration is missing.")
    return store


def _default_dashboard_data() -> DashboardDataResponse:
    return DashboardDataResponse(
        stats=DashboardStats(
            active_incidents=0,
            open_requests=0,
            response_sla="0%",
            teams_deployed="0/0",
        ),
        incidents=[],
        requests=[],
        resources=[],
        allocations=[],
    )


def _metric_bars(counter: Counter, labels: list[str]) -> list[MetricBar]:
    return [MetricBar(label=label, value=int(counter.get(label, 0))) for label in labels]


async def _fetch_nasa_events() -> tuple[list[NasaEventSummary], list[MetricBar], int, str | None]:
    nasa_url = os.getenv("NASA_EONET_URL", "https://eonet.gsfc.nasa.gov/api/v3/events")
    params = {"status": "open", "limit": int(os.getenv("NASA_EONET_LIMIT", "30"))}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(nasa_url, params=params)
            response.raise_for_status()
            payload = response.json()
    except Exception as exc:
        return [], [], 0, f"NASA feed unavailable: {exc}"

    events = payload.get("events", []) if isinstance(payload, dict) else []
    category_counter: Counter[str] = Counter()
    summaries: list[NasaEventSummary] = []

    for event in events:
        categories = event.get("categories", []) if isinstance(event, dict) else []
        primary_category = categories[0].get("title", "Other") if categories else "Other"
        category_counter[primary_category] += 1

        sources = event.get("sources", []) if isinstance(event, dict) else []
        source_label = sources[0].get("id", "NASA EONET") if sources else "NASA EONET"

        summaries.append(
            NasaEventSummary(
                id=str(event.get("id", "unknown")),
                title=str(event.get("title", "Untitled NASA event")),
                category=primary_category,
                source=source_label,
                updated=event.get("geometry", [{}])[-1].get("date") if event.get("geometry") else None,
            )
        )

    nasa_categories = [
        MetricBar(label=label, value=value)
        for label, value in category_counter.most_common(6)
    ]
    return summaries[:6], nasa_categories, len(events), None


@app.get("/api/dashboard-data", response_model=DashboardDataResponse)
async def dashboard_data() -> DashboardDataResponse:
    store = get_supabase_store()
    if store is None:
        return _default_dashboard_data()

    try:
        incidents = await store.list_incidents()
        requests = await store.list_requests()
        resources = await store.list_resources()
        allocations = await store.list_allocations()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load dashboard data: {exc}") from exc

    active_incidents = len([item for item in incidents if item.get("status") != "resolved"])
    open_requests = len([item for item in requests if item.get("status") != "fulfilled"])
    completed = len([item for item in allocations if item.get("status") == "completed"])
    response_sla_value = 100 if not allocations else round((completed / len(allocations)) * 100)

    team_resources = [item for item in resources if item.get("category") == "team"]
    deployed_teams = sum(
        max(int(item.get("total_units", 0)) - int(item.get("available_units", 0)), 0)
        for item in team_resources
    )
    total_teams = sum(int(item.get("total_units", 0)) for item in team_resources)

    return DashboardDataResponse(
        stats=DashboardStats(
            active_incidents=active_incidents,
            open_requests=open_requests,
            response_sla=f"{response_sla_value}%",
            teams_deployed=f"{deployed_teams}/{total_teams}" if total_teams else "0/0",
        ),
        incidents=[IncidentRecord(**item) for item in incidents],
        requests=[RequestRecord(**item) for item in requests],
        resources=[ResourceRecord(**item) for item in resources],
        allocations=[AllocationRecord(**item) for item in allocations],
    )


@app.get("/api/live-intelligence", response_model=LiveIntelligenceResponse)
async def live_intelligence() -> LiveIntelligenceResponse:
    store = get_supabase_store()

    incidents: list[dict] = []
    requests: list[dict] = []
    resources: list[dict] = []

    if store is not None:
        try:
            incidents = await store.list_incidents()
            requests = await store.list_requests()
            resources = await store.list_resources()
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to load intelligence metrics: {exc}") from exc

    incident_counter = Counter(item.get("severity", "Low") for item in incidents)
    request_counter = Counter(item.get("priority", "Low") for item in requests)
    resource_counter = Counter(item.get("status", "depleted") for item in resources)

    nasa_events, nasa_categories, nasa_open_events, nasa_error = await _fetch_nasa_events()

    return LiveIntelligenceResponse(
        generated_at=datetime.now(timezone.utc).isoformat(),
        incident_severity=_metric_bars(incident_counter, ["Critical", "High", "Medium", "Low"]),
        request_priority=_metric_bars(request_counter, ["Critical", "High", "Medium", "Low"]),
        resource_status=_metric_bars(resource_counter, ["available", "limited", "depleted"]),
        nasa_open_events=nasa_open_events,
        nasa_categories=nasa_categories,
        nasa_events=nasa_events,
        nasa_error=nasa_error,
    )


@app.get("/api/chat/history", response_model=ChatHistoryResponse)
async def chat_history(session_id: str = Query(..., min_length=1, max_length=120)) -> ChatHistoryResponse:
    store = _require_store()
    try:
        rows = await store.list_chat_history(session_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load chat history: {exc}") from exc

    return ChatHistoryResponse(
        session_id=session_id,
        messages=[ChatHistoryMessage(role=item["role"], content=item["content"]) for item in rows],
    )


@app.get("/api/incidents", response_model=list[IncidentRecord])
async def list_incidents() -> list[IncidentRecord]:
    store = _require_store()
    rows = await store.list_incidents()
    return [IncidentRecord(**item) for item in rows]


@app.post("/api/incidents", response_model=IncidentRecord)
async def create_incident(payload: IncidentCreate) -> IncidentRecord:
    store = _require_store()
    row = await store.create_incident(payload.model_dump())
    return IncidentRecord(**row)


@app.get("/api/requests", response_model=list[RequestRecord])
async def list_requests() -> list[RequestRecord]:
    store = _require_store()
    rows = await store.list_requests()
    return [RequestRecord(**item) for item in rows]


@app.post("/api/requests", response_model=RequestRecord)
async def create_request(payload: RequestCreate) -> RequestRecord:
    store = _require_store()
    row = await store.create_request(payload.model_dump())
    return RequestRecord(**row)


@app.get("/api/resources", response_model=list[ResourceRecord])
async def list_resources() -> list[ResourceRecord]:
    store = _require_store()
    rows = await store.list_resources()
    return [ResourceRecord(**item) for item in rows]


@app.post("/api/resources", response_model=ResourceRecord)
async def create_resource(payload: ResourceCreate) -> ResourceRecord:
    store = _require_store()
    row = await store.create_resource(payload.model_dump())
    return ResourceRecord(**row)


@app.get("/api/allocations", response_model=list[AllocationRecord])
async def list_allocations() -> list[AllocationRecord]:
    store = _require_store()
    rows = await store.list_allocations()
    return [AllocationRecord(**item) for item in rows]


@app.post("/api/allocations", response_model=AllocationRecord)
async def create_allocation(payload: AllocationCreate) -> AllocationRecord:
    store = _require_store()
    row = await store.create_allocation(payload.model_dump())
    return AllocationRecord(**row)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    session_id = payload.session_id or str(uuid.uuid4())
    store = get_supabase_store()

    try:
        client = get_mistral_client()
        reply = await client.generate_reply(
            payload.message,
            history=[{"role": item.role, "content": item.content} for item in payload.history],
        )
    except MistralClientError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    automation_summary = None
    if store is not None:
        try:
            automation_summary = await process_emergency_message(payload.message, store)
        except Exception:
            automation_summary = None

    if automation_summary:
        reply = f"{reply}\n\n{automation_summary}"

    if store is not None:
        try:
            await store.insert_message(session_id=session_id, role="user", content=payload.message)
            await store.insert_message(session_id=session_id, role="assistant", content=reply)
        except Exception:
            # Keep chat availability even if persistence is misconfigured.
            pass
    else:
        reply = (
            f"{reply}\n\n"
            "NOTE: Supabase persistence is not configured. "
            "Dashboard updates will not be saved until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
        )

    return ChatResponse(reply=reply, session_id=session_id)
