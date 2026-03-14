# QuickBite: AI Nutrition & Meal Planning Platform

QuickBite is a comprehensive, AI-powered platform designed to help busy professionals manage their nutrition, track their goals, and plan their meals effortlessly.

## 🚀 Key Features
- **AI Calorie Tracker**: Take a photo of your food, and our AI vision estimates calories and macros.
- **AI Recipe Search**: Natural language search (e.g., "high protein dinner under 30 mins") powered by Phi-3 and Spoonacular.
- **Meal Planner**: Plan your entire week's meals in minutes.
- **Automated Shopping List**: Generate grocery lists directly from your meal plans.
- **Health Trackers**: Integrated Water Intake and Fasting (16:8, OMAD) trackers.
- **Barcode Scanner**: Scan packaged foods for instant nutritional data.
- **Community**: Share your favorite recipes and meal plans with others.

## 🏗 Architecture
The app follows a modern, scalable architecture:
- **Backend**: FastAPI with a modular domain-driven structure.
- **Frontend**: React + Vite using a feature-based organization.
- **Database**: PostgreSQL for robust data management.
- **Cache/Queue**: Redis for performance and background tasks.

See [ARCHITECTURE.md](ARCHITECTURE.md) for a deep dive into the system design.

## 🛠 Setup & Installation

### Prerequisites
- Docker & Docker Compose
- Spoonacular API Key

### Quick Start (Docker)
1. Clone the repository.
2. Create a `.env` file based on `.env.example`.
3. Run the entire stack:
   ```bash
   docker-compose up --build
   ```
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

### Local Development
Refer to the `ARCHITECTURE.md` for folder structures and the `README` in `ai-recipe-frontend` for frontend-specific instructions.

## 🧪 Testing
Run backend tests:
```bash
export PYTHONPATH=$PYTHONPATH:.
python -m pytest
```

## 📄 License
MIT
