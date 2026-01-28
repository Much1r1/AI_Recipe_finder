import { Recipe } from "../types/recipe";

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Lemon Herb Grilled Chicken",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&h=450&fit=crop",
    ready_in_minutes: 25,
    ingredients: ["chicken breast", "lemon", "garlic", "rosemary", "olive oil"],
    instructions: [
      "Marinate chicken with lemon, garlic, and herbs for 15 minutes",
      "Preheat grill to medium-high heat",
      "Grill chicken for 6-7 minutes per side until cooked through",
      "Let rest for 5 minutes before serving"
    ],
    source_url: "https://example.com/lemon-herb-chicken",
    estimated_cost_kes: 350,
    protein_score: 8,
    protein_per_cost: 0.023,
    match_score: 0.92,
    explanation: ["Ready in under 30 minutes", "High protein", "Budget-friendly"],
  },
  {
    id: "2",
    title: "Quick Teriyaki Salmon Bowl",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=450&fit=crop",
    ready_in_minutes: 18,
    ingredients: ["salmon", "rice", "soy sauce", "ginger", "broccoli"],
    instructions: [
      "Cook rice according to package directions",
      "Pan-sear salmon with teriyaki glaze for 4-5 minutes per side",
      "Steam broccoli for 5 minutes",
      "Assemble bowl with rice, salmon, and broccoli"
    ],
    source_url: "https://example.com/teriyaki-salmon",
    estimated_cost_kes: 550,
    protein_score: 9,
    protein_per_cost: 0.016,
    match_score: 0.88,
    explanation: ["Under 20 minutes", "High protein", "Uses common ingredients"],
  },
  {
    id: "3",
    title: "Mediterranean Chickpea Salad",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&fit=crop",
    ready_in_minutes: 15,
    ingredients: ["chickpeas", "cucumber", "tomatoes", "feta", "olives"],
    instructions: [
      "Drain and rinse chickpeas",
      "Chop cucumber, tomatoes, and olives",
      "Combine all ingredients in a bowl",
      "Dress with olive oil and lemon juice"
    ],
    source_url: "https://example.com/chickpea-salad",
    estimated_cost_kes: 200,
    protein_score: 5,
    protein_per_cost: 0.025,
    match_score: 0.85,
    explanation: ["No cooking required", "Light & refreshing", "Meal prep friendly"],
  },
  {
    id: "4",
    title: "Spicy Shrimp Stir-Fry",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&h=450&fit=crop",
    ready_in_minutes: 20,
    ingredients: ["shrimp", "bell peppers", "snap peas", "garlic", "chili flakes"],
    instructions: [
      "Heat oil in a wok over high heat",
      "Stir-fry shrimp until pink, about 3 minutes",
      "Add vegetables and garlic, cook for 5 minutes",
      "Season with chili flakes and soy sauce"
    ],
    source_url: "https://example.com/shrimp-stirfry",
    estimated_cost_kes: 450,
    protein_score: 8,
    protein_per_cost: 0.018,
    match_score: 0.90,
    explanation: ["Ready in 20 minutes", "High protein", "Low carb"],
  },
  {
    id: "5",
    title: "One-Pan Garlic Butter Pasta",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=450&fit=crop",
    ready_in_minutes: 22,
    ingredients: ["pasta", "garlic", "butter", "parmesan", "parsley"],
    instructions: [
      "Boil pasta in salted water until al dente",
      "In the same pan, melt butter and sauté garlic",
      "Toss cooked pasta with garlic butter",
      "Top with parmesan and fresh parsley"
    ],
    source_url: "https://example.com/garlic-butter-pasta",
    estimated_cost_kes: 180,
    protein_score: 4,
    protein_per_cost: 0.022,
    match_score: 0.78,
    explanation: ["Minimal cleanup", "5 ingredients", "Comfort food"],
  },
];

export function searchRecipes(
  query: string,
  filters: {
    time: string | null;
    budget: string | null;
    goal: string | null;
    ingredients: string[];
  }
): Recipe[] {
  let results = [...mockRecipes];

  // Filter by query (simple text matching)
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(lowerQuery) ||
        recipe.ingredients.some((i) => i.toLowerCase().includes(lowerQuery)) ||
        recipe.explanation?.some((r) => r.toLowerCase().includes(lowerQuery))
    );
  }

  // Filter by cooking time
  if (filters.time === "Under 20 min") {
    results = results.filter((r) => r.ready_in_minutes <= 20);
  } else if (filters.time === "Under 30 min") {
    results = results.filter((r) => r.ready_in_minutes <= 30);
  }

  // Filter by nutritional goal (using protein_score)
  if (filters.goal === "High protein ⚡") {
    results = results.filter((r) => (r.protein_score || 0) >= 7);
  }

  // Filter by ingredients
  if (filters.ingredients.length > 0) {
    results = results.filter((recipe) =>
      filters.ingredients.some((ingredient) =>
        recipe.ingredients.some((ri) =>
          ri.toLowerCase().includes(ingredient.toLowerCase())
        )
      )
    );
  }

  return results.slice(0, 5);
}