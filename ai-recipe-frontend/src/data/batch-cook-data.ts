export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: "Produce" | "Protein" | "Grains & Legumes" | "Pantry & Condiments";
}

export interface Meal {
  id: string;
  name: string;
  emoji: string;
  cookTime: number; // in minutes
  kcal: number;
  servings: number;
  dietaryTags: string[];
  ingredients: Ingredient[];
  steps: string[];
  days: string[]; // Mon, Tue, Wed, etc.
}

export const MOCK_MEALS: Meal[] = [
  {
    id: "1",
    name: "Honey Garlic Salmon",
    emoji: "🐟",
    cookTime: 25,
    kcal: 450,
    servings: 2,
    dietaryTags: ["High Protein", "Gluten-Free"],
    days: ["Mon", "Wed"],
    ingredients: [
      { name: "Salmon Fillets", amount: 2, unit: "pcs", category: "Protein" },
      { name: "Honey", amount: 2, unit: "tbsp", category: "Pantry & Condiments" },
      { name: "Garlic", amount: 3, unit: "cloves", category: "Produce" },
      { name: "Soy Sauce", amount: 1, unit: "tbsp", category: "Pantry & Condiments" },
      { name: "Lemon", amount: 1, unit: "pc", category: "Produce" },
    ],
    steps: [
      "Season salmon with salt and pepper.",
      "Mix honey, minced garlic, soy sauce, and lemon juice.",
      "Sear salmon in a pan for 5 minutes per side.",
      "Pour glaze over salmon and simmer for 2 minutes."
    ]
  },
  {
    id: "2",
    name: "Quinoa Harvest Salad",
    emoji: "🥗",
    cookTime: 15,
    kcal: 320,
    servings: 4,
    dietaryTags: ["Vegan", "High Fiber"],
    days: ["Tue", "Thu", "Fri"],
    ingredients: [
      { name: "Quinoa", amount: 1, unit: "cup", category: "Grains & Legumes" },
      { name: "Kale", amount: 1, unit: "bunch", category: "Produce" },
      { name: "Chickpeas", amount: 1, unit: "can", category: "Grains & Legumes" },
      { name: "Sweet Potato", amount: 2, unit: "pcs", category: "Produce" },
      { name: "Olive Oil", amount: 2, unit: "tbsp", category: "Pantry & Condiments" },
    ],
    steps: [
      "Cook quinoa according to package instructions.",
      "Roast diced sweet potatoes at 200°C for 20 minutes.",
      "Massage kale with olive oil and salt.",
      "Combine all ingredients in a large bowl."
    ]
  },
  {
    id: "3",
    name: "Mediterranean Pasta",
    emoji: "🍝",
    cookTime: 20,
    kcal: 580,
    servings: 3,
    dietaryTags: ["Vegetarian"],
    days: ["Mon", "Sat"],
    ingredients: [
      { name: "Whole Wheat Pasta", amount: 250, unit: "g", category: "Grains & Legumes" },
      { name: "Cherry Tomatoes", amount: 1, unit: "cup", category: "Produce" },
      { name: "Feta Cheese", amount: 100, unit: "g", category: "Protein" },
      { name: "Olives", amount: 0.5, unit: "cup", category: "Pantry & Condiments" },
      { name: "Spinach", amount: 2, unit: "cups", category: "Produce" },
    ],
    steps: [
      "Boil pasta until al dente.",
      "Sauté tomatoes and spinach with garlic.",
      "Toss pasta with veggies and crumbled feta.",
      "Top with olives and a drizzle of olive oil."
    ]
  },
  {
    id: "4",
    name: "Beef & Broccoli Stir-fry",
    emoji: "🥦",
    cookTime: 30,
    kcal: 510,
    servings: 2,
    dietaryTags: ["High Protein"],
    days: ["Wed", "Sun"],
    ingredients: [
      { name: "Beef Strips", amount: 400, unit: "g", category: "Protein" },
      { name: "Broccoli", amount: 1, unit: "head", category: "Produce" },
      { name: "Ginger", amount: 1, unit: "inch", category: "Produce" },
      { name: "Sesame Oil", amount: 1, unit: "tbsp", category: "Pantry & Condiments" },
      { name: "Rice", amount: 1, unit: "cup", category: "Grains & Legumes" },
    ],
    steps: [
      "Cook rice according to package instructions.",
      "Stir-fry beef in a hot wok until browned.",
      "Add broccoli and ginger, cook for 3-5 minutes.",
      "Add sauce and toss to coat everything."
    ]
  }
];
