import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface Meal {
  id: number;
  name: string;
  kcal: number;
  protein: string;
  emoji: string;
}

interface MealScrollProps {
  meals: Meal[];
}

const MealScroll = ({ meals }: MealScrollProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold font-syne text-lg">Today's Meals</h3>
        <button className="text-primary text-sm font-bold uppercase tracking-wider">View All</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {meals.map((meal) => (
          <motion.div
            key={meal.id}
            whileHover={{ y: -5 }}
            className="min-w-[160px] glass-card p-4 space-y-3"
          >
            <span className="text-3xl">{meal.emoji}</span>
            <div className="space-y-1">
              <h4 className="font-bold text-sm truncate">{meal.name}</h4>
              <p className="text-xs text-muted-foreground">{meal.kcal} kcal</p>
            </div>
            <div className="px-2 py-0.5 bg-secondary/20 text-secondary text-[10px] font-bold rounded-md inline-block uppercase">
              {meal.protein} Protein
            </div>
          </motion.div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="min-w-[160px] border-2 border-dashed border-border rounded-[24px] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm">Add Meal</span>
        </motion.button>
      </div>
    </div>
  );
};

export default MealScroll;
