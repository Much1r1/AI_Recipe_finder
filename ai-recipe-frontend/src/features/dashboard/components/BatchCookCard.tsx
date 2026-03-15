import { Flame, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const BatchCookCard = () => {
  return (
    <Link to="/meal-planner" className="block">
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="glass-card p-6 flex items-center justify-between group cursor-pointer hover:bg-card/60 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-400">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-bold font-syne text-lg">Batch Cook Planner</h4>
            <p className="text-sm text-muted-foreground">Prepare meals for the week</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <ArrowRight className="w-5 h-5" />
        </div>
      </motion.div>
    </Link>
  );
};

export default BatchCookCard;
