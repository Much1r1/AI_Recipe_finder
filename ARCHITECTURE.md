# Architecture Redesign: QuickBite (AI Recipe Finder) to Full AI Nutrition & Meal Planning Platform

## 1. Scalable Backend Folder Structure (FastAPI)
A modular, domain-driven design ensures that as the app grows, it remains maintainable.

```text
app/
├── api/                # API Route handlers
│   ├── v1/
│   │   ├── endpoints/  # Feature-specific routes (recipes, users, tracking, etc.)
│   │   └── api.py      # Main router assembly
├── core/               # Global config, security (JWT), constants
├── crud/               # Create, Read, Update, Delete logic (separates DB from API)
├── db/                 # Database connection and session management
├── models/             # SQLAlchemy models
├── schemas/            # Pydantic models (data validation/serialization)
├── services/           # External integrations (AI, Spoonacular, etc.)
├── utils/              # Helper functions (conversions, formatting)
└── main.py             # Entry point
```

## 2. Scalable Frontend Folder Structure (React + Vite)
Adopting a "Feature-based" structure makes it easy to isolate and test specific parts of the app.

```text
src/
├── assets/             # Static images, fonts
├── components/         # Shared UI components (Button, Input, etc.)
├── features/           # Domain-specific logic
│   ├── auth/           # Login, Registration
│   ├── recipes/        # Search, Details, Recommendations
│   ├── tracker/        # Calorie tracking, Water intake, Fasting
│   ├── meal-planner/   # Weekly calendar, Batch cooking
│   └── shopping-list/  # Grocery management
├── hooks/              # Shared custom hooks
├── lib/                # Third-party library configs (Axios, TanStack Query)
├── services/           # API call wrappers
├── types/              # TypeScript interfaces
├── utils/              # Global helper functions
└── App.tsx
```

## 3. Database Schema (PostgreSQL)
Transitioning to PostgreSQL allows for complex relationships and better scalability.

### Key Tables:
- **users**: id, email, password_hash, created_at, settings (JSONB for goals).
- **nutrition_goals**: user_id, daily_calories, protein_g, carbs_g, fats_g.
- **daily_logs**: user_id, date, total_calories, water_ml, fasting_start, fasting_end.
- **food_entries**: id, user_id, date, name, calories, macros (JSONB), photo_url (for AI vision).
- **recipes**: id, title, source_url, ingredients (JSONB), instructions, nutrition_data (JSONB).
- **meal_plans**: id, user_id, week_start_date, meals (JSONB: mapping days to recipe_ids).
- **shopping_lists**: id, user_id, items (JSONB), is_completed.

## 4. API Endpoint Design (v1)
- `POST /auth/register` & `POST /auth/token`
- `GET/POST /tracker/calories` (with AI vision support)
- `GET/POST /tracker/water`
- `GET/POST /tracker/fasting`
- `GET /recipes/search` & `GET /recipes/{id}`
- `GET/POST /meal-planner`
- `GET /shopping-list`
- `GET /barcode/{code}`

## 5. Recommended AI Integrations
- **Food Recognition**: GPT-4o-vision or Claude 3.5 Sonnet for analyzing food photos and estimating portions/calories.
- **Nutrition Estimation**: Nutritionix API or Edamam for mapping recognized food items to accurate data.

## 6. Suggested Third-Party APIs
- **Barcode/Nutrition**: [OpenFoodFacts](https://world.openfoodfacts.org/data) (Free/Open), [Nutritionix](https://www.nutritionix.com/business/api).
- **Recipes**: [Spoonacular](https://spoonacular.com/food-api) (Already used, excellent for meal planning).

## 7. Keeping Architecture Modular
- **Service Layer**: All external API calls (Spoonacular, GPT) should live in `app/services/`. The rest of the app shouldn't know how the data is fetched.
- **Dependency Injection**: Use FastAPI's `Depends` for DB sessions and auth to make testing easier.
- **Feature Flags**: Use environment variables to toggle new features during deployment.

## 8. Background Jobs, Caching, and Scaling
- **Background Jobs**: Use **Celery** or **TaskIQ** with **Redis** to handle image processing and reminder notifications.
- **Caching**: Use **Redis** to cache recipe search results and external API responses to save costs and reduce latency.
- **Scaling**: Deploy as Docker containers. Scale the backend horizontally behind a load balancer (Railway/Vercel handle this natively).

## 9. Authentication and User Accounts
- **JWT (JSON Web Tokens)**: Secure, stateless authentication.
- **OAuth2**: For "Login with Google/Apple" functionality.
- **Bcrypt**: For secure password hashing.

## 10. Step-by-Step Implementation Roadmap
1. **Foundation**: Migrate SQLite to PostgreSQL and set up the new folder structure.
2. **Auth**: Implement user registration and login.
3. **Core Tracking**: Build Custom Nutrient Goals and the Water Tracker.
4. **AI Vision**: Integrate GPT-4o-vision for the Calorie Tracker.
5. **Nutrition Data**: Integrate Barcode Scanner and Nutrition Facts for every recipe.
6. **Planning**: Build the Meal Planner and Auto Shopping List.
7. **Refinement**: Add Fasting Tracker and Batch Cooking Mode.
8. **Community**: (Optional) Add sharing and social features.
