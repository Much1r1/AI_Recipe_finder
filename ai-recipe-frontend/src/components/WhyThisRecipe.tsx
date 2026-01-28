import { Lightbulb } from "lucide-react";

type Props = {
  reasons?: string[];
  showIcon?: boolean;
};

export default function WhyThisRecipe({ reasons = [], showIcon = false }: Props) {
  if (!reasons.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
        {showIcon && <Lightbulb className="w-3 h-3" />}
        Why this recipe?
      </p>
      <div className="flex flex-wrap gap-1.5">
        {reasons.map((reason, i) => (
          <span 
            key={i} 
            className="inline-block px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
          >
            {reason}
          </span>
        ))}
      </div>
    </div>
  );
}