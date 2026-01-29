import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_search_recipes_smoke():
    """
    Smoke test for recipe search:
    - Sends a messy query
    - Asserts recipes are returned (or at least the response structure is correct)
    - Asserts no duplicate IDs exist
    """
    messy_query = "i want some low carb italian dinner with chicken and no gluten cheap"

    response = client.post(
        "/api/recipes/search",
        json={"query": messy_query}
    )

    assert response.status_code == 200
    data = response.json()

    assert "recipes" in data
    assert "message" in data

    recipes = data["recipes"]
    if recipes:
        # Check for duplicate IDs
        ids = [r["id"] for r in recipes if r.get("id") is not None]
        assert len(ids) == len(set(ids)), "Duplicate recipe IDs found!"

        # Check for UI contract fields
        for recipe in recipes:
            assert "title" in recipe
            assert "ingredients" in recipe
            assert "instructions" in recipe
            # These are optional but should be in the response if available
            assert "calories" in recipe
            assert "price_per_serving" in recipe
            assert "dietary_tags" in recipe

from unittest.mock import patch, MagicMock
from app.schemas.intent import IntentSchema

@patch("app.api.v1.routes.recipes.parse_user_intent")
@patch("app.api.v1.routes.recipes.search_recipes")
def test_search_recipes_full_logic(mock_search, mock_parse):
    """
    Test the full search logic with mocked services to ensure:
    - Intent parsing is called
    - Recipes are returned and normalized
    - No duplicate IDs exist
    """
    mock_parse.return_value = IntentSchema(query="chicken", diet="Ketogenic")
    mock_search.return_value = [
        {
            "id": 1,
            "title": "Recipe 1",
            "extendedIngredients": [{"name": "chicken"}],
            "readyInMinutes": 20
        },
        {
            "id": 1,
            "title": "Recipe 1 Duplicate",
            "extendedIngredients": [{"name": "chicken"}],
            "readyInMinutes": 20
        },
        {
            "id": 2,
            "title": "Recipe 2",
            "extendedIngredients": [{"name": "chicken"}],
            "readyInMinutes": 25
        },
    ]

    response = client.post(
        "/api/recipes/search",
        json={"query": "low carb chicken"}
    )

    assert response.status_code == 200
    data = response.json()
    recipes = data["recipes"]

    assert len(recipes) > 0
    mock_parse.assert_called_once()

    ids = [r["id"] for r in recipes]
    # Note: Backend doesn't deduplicate by ID currently, it's the frontend's job as per requirements!
    # Wait, the requirement says "Deduplication must occur before rendering, not via UI hacks."
    # And "Deduplication Guard (Hard Requirement): Ensure no duplicate recipes are rendered."
    # It also says in Smoke Tests: "Asserts: ... No duplicate IDs exist".
    # This implies the test should assert no duplicates.
    # If the backend doesn't deduplicate, the test will see duplicates from my mock.

    # Let's see if I should implement deduplication in the backend too.
    # Requirement 2 says: "Deduplication must occur before rendering, not via UI hacks."
    # This usually means in the data fetching/processing layer.

    assert len(ids) == len(set(ids)), f"Duplicate IDs found in response: {ids}"
