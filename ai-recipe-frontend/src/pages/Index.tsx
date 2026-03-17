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
import { useApp } from "@/context/AppContext";
import { useNotifications } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X as CloseIcon } from "lucide-react";
import { askClaude } from "@/lib/claude";

const Index = () => {
  const { toast } = useToast();
  const { state } = useApp();
  const { requestPermission } = useNotifications();
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
  const [showPermissionBanner, setShowPermissionBanner] = useState(() => {
    return Notification.permission !== 'granted' && localStorage.getItem('hide_notification_banner') !== 'true';
  });

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

      const ingredients = query + (filterStrings.length > 0 ? " " + filterStrings.join(", ") : "");

      const result = await askClaude(
        "You are a recipe expert. Return ONLY a JSON array of 3 recipes: [{ \"id\": string, \"title\": string, \"emoji\": string, \"calories\": number, \"ingredients\": string[], \"instructions\": string[], \"protein_score\": number, \"ready_in_minutes\": number, \"estimated_cost_kes\": number }]",
        `Suggest healthy recipes using: ${ingredients}`
      );

      const recipesData = JSON.parse(result);

      const mappedRecipes: Recipe[] = recipesData.map((r: any, i: number) => ({
        id: r.id || `recipe-${Date.now()}-${i}`,
        title: r.title || r.name || "Untitled Recipe",
        image: null,
        ingredients: r.ingredients || [],
        instructions: r.steps || r.instructions || [],
        ready_in_minutes: r.ready_in_minutes || 30,
        calories: r.calories || 0,
        estimated_cost_kes: r.estimated_cost_kes || 500,
        protein_score: r.protein || r.protein_score || 0,
        explanation: [`High in protein`, `Quick to prepare`]
      }));

      setRecipes(mappedRecipes);
      setMessage("Here are your AI-curated recipes.");
    } catch (error) {
      console.error("Search failed:", error);
      setError("Failed to fetch recipes. Please check your connection.");
      setRecipes([]);
      toast({
        title: "Search failed",
        description: "Could not fetch recipes. Please check your connection.",
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
        {/* Notification Permission Banner */}
        <AnimatePresence>
          {showPermissionBanner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-primary/20 rounded-[24px] p-4 flex items-center justify-between shadow-lg mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-syne">Stay on track</h4>
                    <p className="text-[10px] text-muted-foreground">Enable reminders for water and meals.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await requestPermission();
                      setShowPermissionBanner(false);
                    }}
                    className="bg-primary text-primary-foreground text-[10px] font-bold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
                  >
                    Enable
                  </button>
                  <button
                    onClick={() => {
                      setShowPermissionBanner(false);
                      localStorage.setItem('hide_notification_banner', 'true');
                    }}
                    className="p-2 text-muted-foreground hover:text-foreground"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Welcome Section */}
        <section className="space-y-1">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-muted-foreground font-medium"
          >
            Welcome back, {state.user.name}
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
            consumed={state.today.caloriesConsumed}
            goal={state.goals.calories}
            macros={{
              protein: { current: Number(state.today.meals.reduce((acc, m) => acc + (Number(m.protein) || 0), 0)), goal: state.goals.protein },
              carbs: { current: Number(state.today.meals.reduce((acc, m) => acc + (Number(m.carbs) || 0), 0)), goal: state.goals.carbs },
              fats: { current: Number(state.today.meals.reduce((acc, m) => acc + (Number(m.fats) || 0), 0)), goal: state.goals.fats },
            }}
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
            protocol="16:8"
            startTime={state.today.fastingStart}
            totalHours={16}
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
          <MealScroll meals={state.today.meals} />
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
