import { usePersistentState } from "@/hooks/use-dashboard-data";
import { ShoppingBag, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface ShoppingItem {
  id: number;
  text: string;
  checked: boolean;
}

const ShoppingListCard = () => {
  const [items, setItems] = usePersistentState<ShoppingItem[]>("shopping_list", [
    { id: 1, text: "Avocados (3x)", checked: false },
    { id: 2, text: "Greek Yogurt", checked: true },
    { id: 3, text: "Oat Milk", checked: false },
  ]);

  const toggleItem = (id: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const activeCount = items.filter(i => !i.checked).length;

  return (
    <div className="glass-card p-6 space-y-4">
      <Link to="/shop" className="flex items-center justify-between group">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/20 rounded-xl text-primary group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-bold font-syne group-hover:text-primary transition-colors">Shopping List</h3>
        </div>
        <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20">
          {activeCount} items
        </div>
      </Link>

      <div className="space-y-2">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            onClick={() => toggleItem(item.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors border border-transparent",
              item.checked ? "opacity-50" : "hover:bg-muted hover:border-white/5"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
              item.checked ? "bg-primary border-primary" : "border-muted-foreground"
            )}>
              {item.checked && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
            </div>
            <span className={cn(
              "text-sm font-medium",
              item.checked && "line-through text-muted-foreground"
            )}>
              {item.text}
            </span>
          </motion.div>
        ))}
      </div>

      <button className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2 text-sm font-bold">
        <Plus className="w-4 h-4" />
        Add Item
      </button>
    </div>
  );
};

export default ShoppingListCard;
