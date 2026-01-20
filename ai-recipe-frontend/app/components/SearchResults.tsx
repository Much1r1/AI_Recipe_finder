import LoadingState from "./states/LoadingState";
import EmptyState from "./states/EmptyState";
import ErrorState from "./states/ErrorState";
import RecipeCard from "./RecipeCard";
import { Recipe } from "../types/recipe";

type Props = {
  recipes: Recipe[];
  loading: boolean;
  error?: string;
};

export default function SearchResults({ recipes, loading, error }: Props) {
  if (loading) return <LoadingState />;

  if (error) return <ErrorState message={error} />;

  if (!loading && recipes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="recipe-list space-y-4 mt-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.title} recipe={recipe} />
      ))}
    </div>
  );
}
