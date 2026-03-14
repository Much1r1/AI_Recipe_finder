import { motion } from "framer-motion";
import { Recipe } from "../types/recipe";
import RecipeCard from "./RecipeCard";

interface RecipeListProps {
  recipes: Recipe[];
  maxItems?: number;
}

export default function RecipeList({ recipes, maxItems }: RecipeListProps) {
  const displayedRecipes = maxItems ? recipes.slice(0, maxItems) : recipes;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
    >
      {displayedRecipes.map((recipe, index) => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          index={index}
        />
      ))}
    </motion.div>
  );
}