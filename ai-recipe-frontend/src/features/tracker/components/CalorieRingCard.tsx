import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
}

const MacroBar = ({ label, current, goal, color }: MacroBarProps) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-medium text-muted-foreground uppercase">
      <span>{label}</span>
      <span>{current}g / {goal}g</span>
    </div>
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((current / goal) * 100, 100)}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  </div>
);

interface CalorieRingCardProps {
  consumed: number;
  goal: number;
  macros: {
    protein: { current: number; goal: number };
    carbs: { current: number; goal: number };
    fats: { current: number; goal: number };
  };
}

const CalorieRingCard = ({ consumed, goal, macros }: CalorieRingCardProps) => {
  const percentage = Math.min((consumed / goal) * 100, 100);
  const circumference = 2 * Math.PI * 40;

  return (
    <Link to="/stats" className="block">
      <div className="glass-card p-6 flex flex-col gap-6 hover:bg-card/60 transition-colors">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{Math.round(percentage)}%</span>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Calories</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold font-syne tracking-tighter">{consumed}</span>
              <span className="text-sm text-muted-foreground font-medium">kcal</span>
            </div>
            <p className="text-xs font-medium text-primary/80">
              {Math.max(goal - consumed, 0)} kcal remaining
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <MacroBar label="Protein" current={macros.protein.current} goal={macros.protein.goal} color="#7ef2c0" />
          <MacroBar label="Carbs" current={macros.carbs.current} goal={macros.carbs.goal} color="#c8f560" />
          <MacroBar label="Fats" current={macros.fats.current} goal={macros.fats.goal} color="#ffb86c" />
        </div>
      </div>
    </Link>
  );
};

export default CalorieRingCard;
