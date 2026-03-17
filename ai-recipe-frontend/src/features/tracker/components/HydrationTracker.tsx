import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const HydrationTracker = () => {
  const { state, setWater } = useApp();

  const toggleCup = (index: number) => {
    const wasFilled = index < state.today.cupsFilledCount;
    if (wasFilled) {
      setWater(Math.max(0, state.today.waterMl - 250), state.today.cupsFilledCount - 1);
    } else {
      setWater(state.today.waterMl + 250, state.today.cupsFilledCount + 1);
    }
  };

  const filledCount = state.today.cupsFilledCount;
  const percentage = (filledCount / 8) * 100;

  return (
    <div className="glass-card p-6 space-y-4">
      <Link to="/hydration" className="flex items-center justify-between group">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <Droplet className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="font-bold font-syne group-hover:text-blue-400 transition-colors">Hydration</h3>
        </div>
        <div className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20">
          {percentage}%
        </div>
      </Link>

      <div className="grid grid-cols-4 gap-3">
        {Array(8).fill(0).map((_, i) => {
          const filled = i < state.today.cupsFilledCount;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleCup(i)}
              className={cn(
                "h-12 rounded-xl flex items-center justify-center transition-all duration-300 border",
                filled
                  ? "bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                  : "bg-muted border-border text-muted-foreground"
              )}
            >
              <Droplet className={cn("w-6 h-6", filled && "fill-current")} />
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
        <span>Goal: 2.5L</span>
        <span>Next reminder: 45m</span>
      </div>
    </div>
  );
};

export default HydrationTracker;
