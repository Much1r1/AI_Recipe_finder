"use client";

import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import AmbientBackground from "@/components/AmbientBackground";
import CalorieRingCard from "@/features/tracker/components/CalorieRingCard";
import QuickActions from "@/features/dashboard/components/QuickActions";
import HydrationTracker from "@/features/tracker/components/HydrationTracker";
import FastingTracker from "@/features/tracker/components/FastingTracker";
import MealScroll from "@/features/dashboard/components/MealScroll";
import ActionCards from "@/features/dashboard/components/ActionCards";
import BatchCookCard from "@/features/dashboard/components/BatchCookCard";
import ShoppingListCard from "@/features/dashboard/components/ShoppingListCard";
import CommunityCard from "@/features/dashboard/components/CommunityCard";
import SearchBar from "@/features/recipes/components/SearchBar";
import SearchResults from "@/features/recipes/components/SearchResults";
import { FilterSection, Filters } from "@/features/recipes/components/FilterSection";
import { Recipe } from "@/features/recipes/types/recipe";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const { toast } = useToast();
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardData();
  const [user] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : { name: "Sarah" };
  });
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
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  const [message, setMessage] = useState<string | undefined>();
  const [loadingFact, setLoadingFact] = useState<string | undefined>();

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setError(undefined);
    setLoadingFact(undefined);

    const apiUrl = import.meta.env.VITE_API_URL || "https://ai-recipe-finder-gfdv.onrender.com";
    fetch(`${apiUrl}/api/v1/recipes/verify/random-fact`)
      .then(res => res.json())
      .then(data => setLoadingFact(data.weird_fact))
      .catch(() => {});

    try {
      const filterStrings = [
        filters.time,
        filters.budget,
        filters.goal,
        ...filters.ingredients
      ].filter(Boolean);

      const fullQuery = query + (filterStrings.length > 0 ? " " + filterStrings.join(", ") : "");

      const res = await fetch(
        `${apiUrl}/api/v1/recipes/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: fullQuery }),
        }
      );

      if (!res.ok) throw new Error('Failed to fetch recipes!');

      const data = await res.json();
      const rawRecipes: Recipe[] = (data.recipes && data.recipes.length > 0)
        ? data.recipes
        : (data.results || data.recipes || []);

      setParsedIntent(data.parsed_intent);
      setMessage(data.message);

      const seenIds = new Set();
      const uniqueRecipes = rawRecipes.filter(recipe => {
        if (recipe.id) {
          if (seenIds.has(recipe.id)) return false;
          seenIds.add(recipe.id);
          return true;
        }
        return true;
      });

      setRecipes(uniqueRecipes);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to fetch recipes. Is the backend running?");
      setRecipes([]);
      toast({
        title: "Search failed",
        description: "Could not fetch recipes. Please check if the backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <AmbientBackground />
      <Header />

      <main className="container max-w-2xl mx-auto pt-24 px-6 space-y-8">
        {/* Welcome Section */}
        <section className="space-y-1">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-muted-foreground font-medium"
          >
            Welcome back, {user.name}
          </motion.h2>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold font-syne tracking-tight"
          >
            Ready to <span className="text-primary">thrive?</span>
          </motion.h1>
        </section>

        {/* Primary Stats */}
        <section>
          <CalorieRingCard
            consumed={dashboardData.calories.consumed}
            goal={dashboardData.calories.goal}
            macros={dashboardData.macros}
          />
        </section>

        {/* Quick Actions */}
        <section>
          <QuickActions />
        </section>

        {/* Trackers Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HydrationTracker />
          <FastingTracker
            protocol={dashboardData.fasting.protocol}
            startTime={dashboardData.fasting.startTime}
            totalHours={dashboardData.fasting.totalHours}
          />
        </section>

        {/* Search Section */}
        <section className="space-y-4">
          <div className="flex flex-col gap-4">
            <SearchBar onSearch={handleSearch} />
            <FilterSection
              isExpanded={isFiltersExpanded}
              onToggle={() => setIsFiltersExpanded(!isFiltersExpanded)}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          <AnimatePresence>
            {hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <SearchResults
                  recipes={recipes}
                  loading={isLoading}
                  hasSearched={hasSearched}
                  error={error}
                  parsedIntent={parsedIntent}
                  message={message}
                  loadingFact={loadingFact}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Meal Scroll */}
        <section>
          <MealScroll meals={dashboardData.meals} />
        </section>

        {/* Additional Actions */}
        <section className="space-y-4">
          <ActionCards />
          <BatchCookCard />
        </section>

        {/* Shopping List */}
        <section>
          <ShoppingListCard />
        </section>

        {/* Community */}
        <section>
          <CommunityCard />
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
