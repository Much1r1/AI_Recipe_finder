import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";

interface IngredientInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
}

export function IngredientInput({ ingredients, onChange }: IngredientInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!ingredients.includes(inputValue.trim().toLowerCase())) {
        onChange([...ingredients, inputValue.trim().toLowerCase()]);
      }
      setInputValue("");
    }
  };

  const handleRemove = (ingredient: string) => {
    onChange(ingredients.filter((i) => i !== ingredient));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-card rounded-xl px-4 py-3 border border-border">
        <Plus className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type an ingredient and press Enter"
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
        />
      </div>
      
      <AnimatePresence mode="popLayout">
        {ingredients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {ingredients.map((ingredient) => (
              <motion.span
                key={ingredient}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="ingredient-chip"
              >
                {ingredient}
                <button
                  onClick={() => handleRemove(ingredient)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <p className="text-xs text-muted-foreground">
        Optional — leave empty for inspiration.
      </p>
    </div>
  );
}
