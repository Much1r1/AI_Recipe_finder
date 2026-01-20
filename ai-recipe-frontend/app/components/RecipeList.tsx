import { Recipe } from "../types/recipe";
import RecipeCard from "./RecipeCard";

export default function RecipeList({ recipes }: { recipes: Recipe[] }) {
  return (
    <div className="grid gap-4 mt-6">
      {recipes.map((recipe) => (
        <RecipeCard 
         key={recipe.title} 
         recipe={recipe} 
        />
      ))}
    </div>
  );
}
