import { Camera, Target, Flame, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const QuickActions = () => {
  const actions = [
    { icon: Camera, label: "Snap & Track", color: "bg-orange-500/20 text-orange-400", path: "/tracker" },
    { icon: Target, label: "Goals", color: "bg-primary/20 text-primary", path: "/stats" },
    { icon: Flame, label: "Batch Cook", color: "bg-red-500/20 text-red-400", path: "/meal-planner" },
    { icon: ShoppingCart, label: "List", color: "bg-blue-500/20 text-blue-400", path: "/shop" },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {actions.map((action, i) => (
        <Link key={action.label} to={action.path}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 min-w-[80px]"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 ${action.color}`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {action.label}
            </span>
          </motion.button>
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;
