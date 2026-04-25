import re
from typing import Any

from app.services.huggingface_client import HuggingFaceClientError, get_huggingface_client


EMERGENCY_KEYWORDS = {
    "flood": "Flood",
    "fire": "Fire",
    "earthquake": "Earthquake",
    "accident": "Accident",
    "blast": "Explosion",
    "explosion": "Explosion",
    "landslide": "Landslide",
    "storm": "Storm",
    "cyclone": "Storm",
    "medical": "Medical",
    "injured": "Medical",
    "ambulance": "Medical",
    "rescue": "Rescue",
}

LOCATION_ALIASES = {
    "hebal": "Hebbal",
}


def _normalize_location(raw_location: str) -> str:
    location = raw_location.strip(" .,;-:").lower()

    # Handle phrases like "a flood in hebal" by taking the last location segment.
    location = re.sub(
        r"^(?:a|an|the)\s+(?:[a-z]+\s+){0,3}?(?:flood|fire|earthquake|accident|storm|cyclone|landslide|explosion)\s+in\s+",
        "",
        location,
        flags=re.IGNORECASE,
    )

    # Remove common noise words around extracted location text.
    location = re.sub(r"\b(?:area|zone|region|city|district)\b", "", location, flags=re.IGNORECASE).strip()

    if location in LOCATION_ALIASES:
        return LOCATION_ALIASES[location]

    return " ".join(part.capitalize() for part in location.split()) if location else "Unknown location"


def _extract_location(text: str) -> str:
    patterns = [
        r"\b(?:in|at|near|around|from)\s+([A-Za-z0-9\-\s]{2,60}?)(?=$|[,.!?;])",
        r"\blocation\s*[:\-]\s*([A-Za-z0-9\-\s]{3,60})",
    ]

    matches: list[str] = []
    for pattern in patterns:
        for match in re.finditer(pattern, text, flags=re.IGNORECASE):
            matches.append(match.group(1).strip())

    if matches:
        # Pick the most specific/last mention in the sentence.
        return _normalize_location(matches[-1])

    return "Unknown location"


def _extract_emergency_type(text: str) -> str:
    lowered = text.lower()
    for keyword, emergency_type in EMERGENCY_KEYWORDS.items():
        if keyword in lowered:
            return emergency_type
    return "General emergency"


def _is_emergency_message(text: str) -> bool:
    lowered = text.lower()
    return any(keyword in lowered for keyword in EMERGENCY_KEYWORDS) or "help" in lowered or "urgent" in lowered


async def _infer_severity(text: str) -> str:
    try:
        client = get_huggingface_client()
        result = await client.classify(text, ["Critical", "High", "Medium", "Low"])
        return str(result["label"])
    except HuggingFaceClientError:
        lowered = text.lower()
        if any(word in lowered for word in ["trapped", "collapsed", "severe", "multiple injured", "critical"]):
            return "Critical"
        if any(word in lowered for word in ["urgent", "flood", "fire", "accident"]):
            return "High"
        return "Medium"


def _resource_category_for(emergency_type: str) -> str:
    mapping = {
        "Flood": "transport",
        "Fire": "rescue",
        "Earthquake": "rescue",
        "Accident": "medical",
        "Explosion": "medical",
        "Landslide": "rescue",
        "Storm": "transport",
        "Medical": "medical",
        "Rescue": "rescue",
    }
    return mapping.get(emergency_type, "other")


def _priority_for(severity: str) -> str:
    if severity in {"Critical", "High", "Medium", "Low"}:
        return severity
    return "High"


async def process_emergency_message(message: str, store: Any) -> str | None:
    if not _is_emergency_message(message):
        return None

    location = _extract_location(message)
    emergency_type = _extract_emergency_type(message)
    severity = await _infer_severity(message)
    resource_category = _resource_category_for(emergency_type)

    incident = await store.create_incident(
        {
            "title": f"{emergency_type} reported",
            "severity": severity,
            "description": message[:1000],
            "status": "active",
            "location": location,
        }
    )

    request = await store.create_request(
        {
            "title": f"{emergency_type} response needed at {location}",
            "priority": _priority_for(severity),
            "description": message[:1000],
            "status": "open",
        }
    )

    resources = await store.list_resources()
    nearby_candidates = [
        item
        for item in resources
        if int(item.get("available_units", 0)) > 0 and item.get("status") in {"available", "limited"}
    ]

    location_matches = [
        item
        for item in nearby_candidates
        if location != "Unknown location"
        and isinstance(item.get("name"), str)
        and location.lower() in item.get("name", "").lower()
    ]

    category_matches = [item for item in nearby_candidates if item.get("category") == resource_category]
    selected_resources = (location_matches or category_matches or nearby_candidates)[:2]

    allocations_created: list[str] = []
    for resource in selected_resources:
        units = min(max(int(resource.get("available_units", 1)), 1), 3)
        await store.create_allocation(
            {
                "resource_id": int(resource["id"]),
                "request_id": int(request["id"]),
                "units": units,
                "status": "pending",
            }
        )
        allocations_created.append(f"{units} unit(s) from {resource.get('name', 'resource')} (pending dispatch)")

    if not allocations_created:
        allocations_created.append("No immediately available resources found; command center flagged for manual dispatch.")

    summary = (
        f"Emergency Intake:\n"
        f"- Type: {emergency_type}\n"
        f"- Location: {location}\n"
        f"- Severity: {severity}\n"
        f"- Incident ID: {incident.get('id')}\n"
        f"- Request ID: {request.get('id')}\n"
        f"- Nearby Resource Actions: "
        + "; ".join(allocations_created)
    )

    return summary
