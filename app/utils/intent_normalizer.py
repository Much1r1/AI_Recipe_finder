from app.schemas.intent import IntentSchema
import re

def normalize_intent(intent: IntentSchema) -> IntentSchema:
    """
    Apply lightweight normalization to the parsed intent:
    - "breakfast" -> type=breakfast
    - "healthy" -> NO hard calorie constraint
    - "under 10 minutes" -> maxReadyTime=15 (buffer)
    """
    query_lower = intent.query.lower()

    # 1. Normalize Breakfast
    if "breakfast" in query_lower:
        intent.recipe_type = "breakfast"

    # 2. Normalize "under X minutes" with buffer
    # If the LLM already extracted max_time_minutes, use it, otherwise try to extract it
    if intent.max_time_minutes:
        intent.max_time_minutes += 5
    else:
        time_match = re.search(r"under (\d+)", query_lower)
        if time_match:
            intent.max_time_minutes = int(time_match.group(1)) + 5

    # 3. Handle "healthy"
    # Ensure "healthy" doesn't trigger hard calorie constraints if they weren't explicitly set
    # (Though we already removed the default 800 in LLM service, this is an extra guard)
    if "healthy" in query_lower and intent.max_calories is None:
        # We explicitly do nothing here as per requirements: "DO NOT map to a hard constraint"
        pass

    return intent
