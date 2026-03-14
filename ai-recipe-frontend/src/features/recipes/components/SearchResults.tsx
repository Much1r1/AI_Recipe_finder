import { motion } from "framer-motion";
import { Loader2, ChefHat, Clock } from "lucide-react";
import LoadingState from "./states/LoadingState";
import EmptyState from "./states/EmptyState";
import ErrorState from "./states/ErrorState";
import RecipeCard from "./RecipeCard";
import { Recipe } from "../types/recipe";

type Props = {
  recipes: Recipe[];
  loading: boolean;
  error?: string;
  hasSearched?: boolean;
  parsedIntent?: any;
  message?: string;
  loadingFact?: string;
};

export default function SearchResults({
  recipes,
  loading,
  error,
  hasSearched = false,
  message,
  loadingFact
}: Props) {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-8 py-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center text-center space-y-4"
        >
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <div className="space-y-2">
            <p className="text-foreground text-xl font-medium">
              Finding the best recipes for you…
            </p>
            {loadingFact && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto p-4 bg-accent rounded-2xl border border-accent-foreground/10"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Did you know?</p>
                <p className="text-sm text-muted-foreground italic">"{loadingFact}"</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-2xl overflow-hidden shadow-sm animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-5 space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="flex gap-3">
                  <div className="h-4 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Empty state (only show if user has searched and loading is complete)
  if (hasSearched && !loading && recipes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <ChefHat className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          {message || "No recipes matched your search"}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Try different ingredients or adjust your filters.
        </p>


        <div className="mt-4 flex items-center gap-2 text-sm text-primary">
          <Clock className="w-4 h-4" />
          <span>Tip: Try fewer ingredients or broader terms</span>
        </div>
      </motion.div>
    );
  }

  // No search yet
  if (!hasSearched) {
    return null;
  }

  // Results
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {message && message.includes("broader") && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <RecipeCard key={recipe.id || `${recipe.title}-${index}`} recipe={recipe} index={index} />
        ))}
      </div>
    </motion.div>
  );
}