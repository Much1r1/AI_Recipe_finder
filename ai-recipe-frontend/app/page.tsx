"use client";

import { useState } from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import RecipeList from "./components/RecipeList";
import { Recipe } from "./types/recipe";
import { getPersona, setPersona } from "./lib/persona";
import PersonaBanner from "./components/PersonaBanner";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSearch(query: string) {
    setLoading(true);
    setError(undefined);

    try{
      const persona = getPersona() ?? "busy_professional"
      const res = await fetch(
        "http://localhost:8000/api/recipes/recipes/search",
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            query,
            persona, //Send to backend
          }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to fetch recipes!');
      }

      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to fetch recipes. Is the backend running?");
      setRecipes([]);
    } finally {
      console.log("Search finished");
      setLoading(false); //Always runs
    }

    async function handleSearch(query: string) {
      setLoading(true);

      if (!getPersona()) {
        setPersona("busy_professional");
      }

    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        🧠 AI food decision system
      </h1>
      <PersonaBanner />
      <SearchBar onSearch={handleSearch} />

      <SearchResults
        recipes={recipes}
        loading={loading}
        error={error}
      />

      <RecipeList recipes={recipes} />
    </main>
  );
}
