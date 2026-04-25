import os
from typing import Any

import httpx


class MistralClientError(Exception):
    pass


class MistralClient:
    def __init__(self, api_key: str, model: str) -> None:
        self.api_key = api_key
        self.model = model
        self.base_url = "https://api.mistral.ai/v1/chat/completions"

    async def generate_reply(self, user_message: str, history: list[dict[str, str]] | None = None) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        conversation: list[dict[str, Any]] = [
            {
                "role": "system",
                "content": (
                    "You are a disaster response operations assistant. "
                    "Give concise, practical, safety-first guidance."
                ),
            }
        ]

        if history:
            # Keep a bounded context window to control token usage.
            for item in history[-12:]:
                role = item.get("role", "")
                content = item.get("content", "").strip()
                if role in {"user", "assistant"} and content:
                    conversation.append({"role": role, "content": content})

        conversation.append({"role": "user", "content": user_message})

        payload = {
            "model": self.model,
            "messages": conversation,
            "temperature": 0.3,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPError as exc:
            raise MistralClientError(f"Mistral request failed: {exc}") from exc

        choices = data.get("choices", [])
        if not choices:
            raise MistralClientError("Mistral returned no choices.")

        message = choices[0].get("message", {})
        content = message.get("content", "")
        if not content:
            raise MistralClientError("Mistral returned empty content.")

        return content.strip()


def get_mistral_client() -> MistralClient:
    api_key = os.getenv("MISTRAL_API_KEY", "").strip()
    model = os.getenv("MISTRAL_MODEL", "mistral-small-latest").strip()
    if not api_key:
        raise MistralClientError("MISTRAL_API_KEY is missing. Set it in your environment.")
    return MistralClient(api_key=api_key, model=model)
