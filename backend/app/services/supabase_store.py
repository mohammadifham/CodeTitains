import os
from datetime import datetime, timezone
from typing import Any

import httpx


class SupabaseStore:
    def __init__(
        self,
        url: str,
        service_role_key: str,
        chat_table_name: str,
        incidents_table_name: str,
        requests_table_name: str,
        resources_table_name: str,
        allocations_table_name: str,
    ) -> None:
        self.url = url.rstrip("/")
        self.service_role_key = service_role_key
        self.chat_table_name = chat_table_name
        self.incidents_table_name = incidents_table_name
        self.requests_table_name = requests_table_name
        self.resources_table_name = resources_table_name
        self.allocations_table_name = allocations_table_name

    def _endpoint(self, table_name: str) -> str:
        return f"{self.url}/rest/v1/{table_name}"

    def _headers(self, prefer: str | None = None) -> dict[str, str]:
        headers = {
            "apikey": self.service_role_key,
            "Authorization": f"Bearer {self.service_role_key}",
            "Content-Type": "application/json",
        }
        if prefer:
            headers["Prefer"] = prefer
        return headers

    async def _get(
        self,
        table_name: str,
        params: dict[str, str],
    ) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                self._endpoint(table_name),
                headers=self._headers(),
                params=params,
            )
            response.raise_for_status()
            return response.json()

    async def _insert(self, table_name: str, payload: dict[str, Any]) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                self._endpoint(table_name),
                headers=self._headers(prefer="return=representation"),
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data[0] if data else {}

    async def insert_message(self, session_id: str, role: str, content: str) -> None:
        payload = {
            "session_id": session_id,
            "role": role,
            "content": content,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                self._endpoint(self.chat_table_name),
                headers=self._headers(prefer="return=minimal"),
                json=payload,
            )
            response.raise_for_status()

    async def list_chat_history(self, session_id: str) -> list[dict[str, str]]:
        rows = await self._get(
            self.chat_table_name,
            {
                "select": "role,content",
                "session_id": f"eq.{session_id}",
                "order": "created_at.asc",
            },
        )
        history: list[dict[str, str]] = []
        for row in rows:
            role = row.get("role", "")
            content = row.get("content", "")
            if role in {"user", "assistant"} and content:
                history.append({"role": role, "content": content})
        return history

    async def list_incidents(self) -> list[dict[str, Any]]:
        return await self._get(
            self.incidents_table_name,
            {
                "select": "id,title,severity,description,status,location,created_at",
                "order": "created_at.desc",
                "limit": "20",
            },
        )

    async def list_requests(self) -> list[dict[str, Any]]:
        return await self._get(
            self.requests_table_name,
            {
                "select": "id,title,priority,description,status,created_at",
                "order": "created_at.desc",
                "limit": "20",
            },
        )

    async def list_resources(self) -> list[dict[str, Any]]:
        return await self._get(
            self.resources_table_name,
            {
                "select": "id,name,category,available_units,total_units,status,created_at",
                "order": "created_at.desc",
                "limit": "30",
            },
        )

    async def list_allocations(self) -> list[dict[str, Any]]:
        return await self._get(
            self.allocations_table_name,
            {
                "select": "id,resource_id,request_id,units,status,created_at",
                "order": "created_at.desc",
                "limit": "40",
            },
        )

    async def create_incident(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._insert(self.incidents_table_name, payload)

    async def create_request(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._insert(self.requests_table_name, payload)

    async def create_resource(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._insert(self.resources_table_name, payload)

    async def create_allocation(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._insert(self.allocations_table_name, payload)


def _is_placeholder_value(value: str) -> bool:
    lower = value.strip().lower()
    return (
        not lower
        or "your-" in lower
        or "your_" in lower
        or "example" in lower
        or "changeme" in lower
        or "<" in lower
        or ">" in lower
    )


def _is_valid_supabase_url(url: str) -> bool:
    return bool(url) and url.startswith("http") and not _is_placeholder_value(url)


def _is_valid_service_role_key(key: str) -> bool:
    return bool(key.strip()) and not _is_placeholder_value(key)


def get_supabase_store() -> SupabaseStore | None:
    url = os.getenv("SUPABASE_URL", "").strip()
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    chat_table_name = os.getenv("SUPABASE_MESSAGES_TABLE", "chat_messages").strip() or "chat_messages"
    incidents_table_name = os.getenv("SUPABASE_INCIDENTS_TABLE", "incidents").strip() or "incidents"
    requests_table_name = os.getenv("SUPABASE_REQUESTS_TABLE", "requests").strip() or "requests"
    resources_table_name = os.getenv("SUPABASE_RESOURCES_TABLE", "resources").strip() or "resources"
    allocations_table_name = os.getenv("SUPABASE_ALLOCATIONS_TABLE", "allocations").strip() or "allocations"
    if not _is_valid_supabase_url(url) or not _is_valid_service_role_key(service_role_key):
        return None
    return SupabaseStore(
        url=url,
        service_role_key=service_role_key,
        chat_table_name=chat_table_name,
        incidents_table_name=incidents_table_name,
        requests_table_name=requests_table_name,
        resources_table_name=resources_table_name,
        allocations_table_name=allocations_table_name,
    )
