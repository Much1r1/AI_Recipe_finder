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
};

export default function SearchResults({
  recipes,
  loading,
  error,
  hasSearched = false,
  parsedIntent,
  message
}: Props) {
  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-lg">
          Finding the best recipes for you…
        </p>
      </motion.div>
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

        {parsedIntent && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg text-left max-w-md w-full">
            <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">[DEV MODE] Parsed Intent</p>
            <pre className="text-xs font-mono overflow-auto">
              {JSON.stringify(parsedIntent, null, 2)}
            </pre>
          </div>
        )}

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

      {parsedIntent && (
          <div className="p-4 bg-muted/30 rounded-lg text-left">
            <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">[DEV MODE] Parsed Intent</p>
            <pre className="text-xs font-mono overflow-auto">
              {JSON.stringify(parsedIntent, null, 2)}
            </pre>
          </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <RecipeCard key={recipe.id || `${recipe.title}-${index}`} recipe={recipe} index={index} />
        ))}
      </div>
    </motion.div>
  );
}