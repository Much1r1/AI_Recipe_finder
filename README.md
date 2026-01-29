# AI Recipe Generator

An AI-powered recipe search engine that understands messy user intent and returns personalized recipe recommendations.

## Features
- **Intent Parsing**: Uses Phi-3 to extract ingredients, diet, and constraints from natural language.
- **Spoonacular Integration**: Fetches real recipes based on parsed intent.
- **Deduplication**: Ensures no duplicate recipes are shown (implemented in both backend and frontend).
- **UI Contract**: Displays title, image, calories, price per serving, and dietary tags.
- **Dockerized**: Easy deployment with Docker Compose.

## Setup

### Environment Variables

Create a `.env` file in the root for the backend:
```env
SPOONACULAR_API_KEY=your_key_here
OLLAMA_URL=http://localhost:11434/api/generate
```

Create a `.env.local` file in `ai-recipe-frontend/`:
```env
VITE_API_URL=http://localhost:8000
```

### Local Development

1. **Backend**:
   ```bash
   pip install -r requirements.txt
   export PYTHONPATH=$PYTHONPATH:.
   uvicorn app.main:app --reload
   ```

2. **Frontend**:
   ```bash
   cd ai-recipe-frontend
   npm install
   npm run dev
   ```

### Docker Deployment

Run both services with:
```bash
docker-compose up --build
```
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

## API Contract

### Search Recipes
- **Endpoint**: `POST /api/recipes/search`
- **Payload**: `{ "query": "string" }`
- **Response**:
  ```json
  {
    "recipes": [
      {
        "id": 123,
        "title": "Recipe Title",
        "image": "url",
        "calories": 450,
        "price_per_serving": 250,
        "dietary_tags": ["Vegetarian", "Gluten Free"],
        ...
      }
    ],
    "message": "Recipes fetched successfully"
  }
  ```

## Smoke Test Example (curl)

```bash
curl -X POST http://localhost:8000/api/recipes/search \
     -H "Content-Type: application/json" \
     -d '{"query": "low carb chicken dinner"}'
```

## Testing
Run backend tests:
```bash
export PYTHONPATH=$PYTHONPATH:.
python -m pytest tests/test_smoke.py
```

## Known Limitations
- Requires a valid Spoonacular API key for full results.
- Intent parsing depends on Ollama (Phi-3) availability; fallbacks are in place.
- Calories and Price may not be available for all recipes from the API.
