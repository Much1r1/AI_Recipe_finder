"use client";

import { useState } from "react";
import { Utensils } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import PersonaBanner from "@/components/PersonaBanner";
import { Recipe } from "@/types/recipe";
import { getPersona, setPersona } from "@/lib/persona";
import { Filters, FilterSection } from "@/components/FilterSection";

export default function Home() {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    time: null,
    budget: null,
    goal: null,
    ingredients: [],
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setError(undefined);

    try {
      const persona = getPersona() ?? "busy_professional";
      
      const res = await fetch(
        "http://localhost:8000/api/recipes/recipes/search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            persona,
            filters, // Include filters in the request
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-6 pb-4 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 animate-fade-in">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Utensils className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">
              QuickBite
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-8 pb-6 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <PersonaBanner />
          
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-3 animate-fade-in">
            What will you cook today?
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8 animate-fade-in">
            Find recipes that fit your schedule, budget, and goals.
          </p>

          <div className="animate-fade-in">
            <SearchBar onSearch={handleSearch} />
            <FilterSection
              isExpanded={isFiltersExpanded}
              onToggle={() => setIsFiltersExpanded(!isFiltersExpanded)}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8 px-4">
        <div className="container max-w-5xl mx-auto">
          <SearchResults
            recipes={recipes}
            loading={isLoading}
            hasSearched={hasSearched}
            error={error}
          />
        </div>
      </section>

      {/* Subtle footer */}
      <footer className="py-8 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          Recipes curated for busy professionals
        </p>
      </footer>
    </div>
  );
}