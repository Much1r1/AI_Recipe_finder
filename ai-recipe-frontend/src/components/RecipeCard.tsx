import { motion } from "framer-motion";
import { Clock, Zap, DollarSign } from "lucide-react";
import PersonalizationBadge from "./PersonalizationBadge";
import WhyThisRecipe from "./WhyThisRecipe";
import { Recipe } from "../types/recipe";

type Props = {
  recipe: Recipe;
  index?: number;
};

export default function RecipeCard({ recipe, index = 0 }: Props) {
  return (
    <motion.article
      className="recipe-card border rounded-lg shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {recipe.image && (
        <div className="aspect-4/3 overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-serif text-xl font-semibold text-foreground leading-tight">
            {recipe.title}
          </h3>
          <PersonalizationBadge />
        </div>
        
        {/* Key Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {recipe.ready_in_minutes} min
          </span>
          
          {recipe.protein_score && recipe.protein_score >= 7 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
              <Zap className="w-3 h-3" />
              High protein
            </span>
          )}

          {recipe.estimated_cost_kes && (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              KES {recipe.estimated_cost_kes}
            </span>
          )}
        </div>
        
        {/* Ingredients Preview */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {recipe.ingredients.slice(0, 5).join(" · ")}
          </p>
        )}
        
        {/* Why This Recipe */}
        {recipe.explanation && recipe.explanation.length > 0 && (
          <div className="pt-2 border-t border-border">
            <WhyThisRecipe reasons={recipe.explanation} showIcon />
          </div>
        )}

        {recipe.source_url && (
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 inline-block mt-2 font-medium"
          >
            View full recipe →
          </a>
        )}
      </div>
    </motion.article>
  );
}