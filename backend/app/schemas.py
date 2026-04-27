from typing import Literal

from pydantic import BaseModel, Field


class ChatHistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[ChatHistoryMessage] = Field(default_factory=list)
    session_id: str | None = Field(default=None, min_length=1, max_length=120)


class ChatResponse(BaseModel):
    reply: str
    session_id: str


class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=160)
    severity: Literal["Critical", "High", "Medium", "Low"]
    description: str = Field(..., min_length=1, max_length=1000)
    status: Literal["active", "monitoring", "resolved"] = "active"
    location: str = Field(..., min_length=1, max_length=160)


class IncidentRecord(IncidentCreate):
    id: int
    created_at: str


class RequestCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=160)
    priority: Literal["Critical", "High", "Medium", "Low"]
    description: str = Field(..., min_length=1, max_length=1000)
    status: Literal["open", "in_progress", "fulfilled"] = "open"


class RequestRecord(RequestCreate):
    id: int
    created_at: str


class ResourceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    category: Literal["medical", "rescue", "food", "transport", "team", "other"] = "other"
    available_units: int = Field(..., ge=0)
    total_units: int = Field(..., ge=0)
    status: Literal["available", "limited", "depleted"] = "available"


class ResourceRecord(ResourceCreate):
    id: int
    created_at: str


class AllocationCreate(BaseModel):
    resource_id: int = Field(..., gt=0)
    request_id: int = Field(..., gt=0)
    units: int = Field(..., gt=0)
    status: Literal["pending", "in_transit", "completed"] = "pending"


class AllocationRecord(AllocationCreate):
    id: int
    created_at: str


class DashboardStats(BaseModel):
    active_incidents: int
    open_requests: int
    response_sla: str
    teams_deployed: str


class DashboardDataResponse(BaseModel):
    stats: DashboardStats
    incidents: list[IncidentRecord]
    requests: list[RequestRecord]
    resources: list[ResourceRecord]
    allocations: list[AllocationRecord]


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: list[ChatHistoryMessage]


class ModelInferenceRequest(BaseModel):
    text: str = Field(..., min_length=5, max_length=3000)


class ModelInferenceResponse(BaseModel):
    label: str
    score: float
    labels: list[str]
    scores: list[float]


class MetricBar(BaseModel):
    label: str
    value: int


class NasaEventSummary(BaseModel):
    id: str
    title: str
    category: str
    source: str
    updated: str | None = None


class LiveIntelligenceResponse(BaseModel):
    generated_at: str
    incident_severity: list[MetricBar]
    request_priority: list[MetricBar]
    resource_status: list[MetricBar]
    nasa_open_events: int
    nasa_categories: list[MetricBar]
    nasa_events: list[NasaEventSummary]
    nasa_error: str | None = None
