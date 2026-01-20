import PersonalizationBadge from "./PersonalizationBadge";
import WhyThisRecipe from "./WhyThisRecipe";
import { Recipe } from "../types/recipe";

type Props = {
  recipe: Recipe;
};

export default function RecipeCard({ recipe }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{recipe.title}</h3>
        <PersonalizationBadge />
      </div>

      <p className="text-sm text-gray-500 mt-1">
        ⏱ {recipe.ready_in_minutes ?? "—"} mins
      </p>

      <WhyThisRecipe reasons={recipe.explanation ?? []} />

      {recipe.source_url && (
        <a
          href={recipe.source_url}
          target="_blank"
          className="text-sm text-blue-600 mt-2 inline-block"
        >
          View full recipe →
        </a>
      )}
    </div>
  );
}
