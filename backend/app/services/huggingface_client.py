import os
from typing import Any

import httpx


class HuggingFaceClientError(Exception):
    pass


class HuggingFaceClient:
    def __init__(self, api_key: str, model: str) -> None:
        self.api_key = api_key
        self.model = model
        self.base_url = f"https://router.huggingface.co/hf-inference/models/{self.model}"

    async def classify(self, text: str, candidate_labels: list[str]) -> dict[str, Any]:
        payload = {
            "inputs": text,
            "parameters": {
                "candidate_labels": candidate_labels,
                "multi_label": False,
            },
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=40.0) as client:
                response = await client.post(self.base_url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
        except httpx.HTTPError as exc:
            raise HuggingFaceClientError(f"Hugging Face request failed: {exc}") from exc

        if isinstance(data, dict):
            if "error" in data:
                raise HuggingFaceClientError(f"Hugging Face API error: {data.get('error')}")

            labels = data.get("labels", [])
            scores = data.get("scores", [])
            if isinstance(labels, list) and labels and isinstance(scores, list) and scores:
                top_label = str(labels[0])
                top_score = float(scores[0])
                return {
                    "label": top_label,
                    "score": top_score,
                    "labels": labels,
                    "scores": scores,
                }

        if isinstance(data, list) and data and isinstance(data[0], dict):
            labels: list[str] = []
            scores: list[float] = []
            for item in data:
                label = item.get("label")
                score = item.get("score")
                if isinstance(label, str) and isinstance(score, (int, float)):
                    labels.append(label)
                    scores.append(float(score))

            if labels and scores:
                return {
                    "label": labels[0],
                    "score": scores[0],
                    "labels": labels,
                    "scores": scores,
                }

        raise HuggingFaceClientError("Hugging Face returned an unexpected response format.")


def get_huggingface_client() -> HuggingFaceClient:
    api_key = os.getenv("HUGGINGFACE_API_KEY", "").strip()
    model = os.getenv("HUGGINGFACE_MODEL", "facebook/bart-large-mnli").strip()
    if not api_key:
        raise HuggingFaceClientError(
            "HUGGINGFACE_API_KEY is missing. Set it in backend/.env from your Hugging Face account token."
        )
    return HuggingFaceClient(api_key=api_key, model=model)
