import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, Wallet, Target, ShoppingBasket } from "lucide-react";
import { ChipToggle } from "./ChipToggle";
import { IngredientInput } from "./IngredientInput";

export interface Filters {
  time: string | null;
  budget: string | null;
  goal: string | null;
  ingredients: string[];
}

interface FilterSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const timeOptions = ["Under 20 min", "Under 30 min", "No limit"];
const budgetOptions = ["Cheap", "Moderate", "Doesn't matter"];
const goalOptions = ["High protein ⚡", "Balanced", "Light / low calorie"];

export function FilterSection({ isExpanded, onToggle, filters, onFiltersChange }: FilterSectionProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <span className="text-sm font-medium">Refine your search</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-6 space-y-6">
              {/* Cooking Time */}
              <FilterGroup
                icon={<Clock className="w-4 h-4" />}
                question="How much time do you have?"
              >
                <div className="flex flex-wrap gap-2">
                  {timeOptions.map((option) => (
                    <ChipToggle
                      key={option}
                      label={option}
                      isActive={filters.time === option}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          time: filters.time === option ? null : option,
                        })
                      }
                    />
                  ))}
                </div>
              </FilterGroup>

              {/* Budget */}
              <FilterGroup
                icon={<Wallet className="w-4 h-4" />}
                question="What's your budget?"
              >
                <div className="flex flex-wrap gap-2">
                  {budgetOptions.map((option) => (
                    <ChipToggle
                      key={option}
                      label={option}
                      isActive={filters.budget === option}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          budget: filters.budget === option ? null : option,
                        })
                      }
                    />
                  ))}
                </div>
              </FilterGroup>

              {/* Nutritional Goal */}
              <FilterGroup
                icon={<Target className="w-4 h-4" />}
                question="What's your main goal?"
              >
                <div className="flex flex-wrap gap-2">
                  {goalOptions.map((option) => (
                    <ChipToggle
                      key={option}
                      label={option}
                      isActive={filters.goal === option}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          goal: filters.goal === option ? null : option,
                        })
                      }
                    />
                  ))}
                </div>
              </FilterGroup>

              {/* Ingredients */}
              <FilterGroup
                icon={<ShoppingBasket className="w-4 h-4" />}
                question="What ingredients do you have?"
              >
                <IngredientInput
                  ingredients={filters.ingredients}
                  onChange={(ingredients) =>
                    onFiltersChange({ ...filters, ingredients })
                  }
                />
              </FilterGroup>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FilterGroupProps {
  icon: React.ReactNode;
  question: string;
  children: React.ReactNode;
}

function FilterGroup({ icon, question, children }: FilterGroupProps) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary">{icon}</span>
        <h3 className="text-sm font-medium text-foreground">{question}</h3>
      </div>
      {children}
    </div>
  );
}
