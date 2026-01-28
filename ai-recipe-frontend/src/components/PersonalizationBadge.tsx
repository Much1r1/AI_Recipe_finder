import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalizationBadgeProps {
  label?: string;
  variant?: "default" | "highlight" | "subtle";
  className?: string;
}

export default function PersonalizationBadge({ 
  label = "Busy Pro Pick", 
  variant = "default",
  className 
}: PersonalizationBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
        {
          "bg-primary/10 text-primary": variant === "default",
          "bg-primary text-primary-foreground": variant === "highlight",
          "bg-soft-sage/60 text-foreground": variant === "subtle",
        },
        className
      )}
    >
      <Sparkles className="w-3 h-3" />
      {label}
    </span>
  );
}