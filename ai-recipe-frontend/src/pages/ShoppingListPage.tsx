import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Plus,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  ShoppingCart,
  Clock,
  LayoutGrid,
  Search,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { usePersistentState } from "@/hooks/use-dashboard-data";
import { MOCK_MEALS, Ingredient } from "@/data/batch-cook-data";
import AmbientBackground from "@/components/AmbientBackground";

interface ShoppingItem extends Ingredient {
  id: string;
  checked: boolean;
  source: "batch" | "manual";
  mealId?: string;
}

const CATEGORIES = ["Produce", "Protein", "Grains & Legumes", "Pantry & Condiments"];

const ShoppingListPage = () => {
  const navigate = useNavigate();
  const [selectedMealIds] = usePersistentState<string[]>("batch_selected_ids", []);
  const [mealServings] = usePersistentState<Record<string, number>>("batch_meal_servings", {});
  const [manualItems, setManualItems] = usePersistentState<ShoppingItem[]>("shopping_manual_items", []);
  const [checkedItems, setCheckedItems] = usePersistentState<string[]>("shopping_checked_ids", []);

  const [newItemName, setNewItemName] = useState("");
  const [filterTab, setFilterTab] = useState("All");
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);

  // Generate items from batch cook
  const batchItems = useMemo(() => {
    const items: ShoppingItem[] = [];
    MOCK_MEALS.forEach(meal => {
      if (selectedMealIds.includes(meal.id)) {
        const servings = mealServings[meal.id] || meal.servings;
        const multiplier = servings / meal.servings;

        meal.ingredients.forEach((ing, idx) => {
          items.push({
            ...ing,
            id: `batch-${meal.id}-${idx}`,
            amount: Math.round(ing.amount * multiplier * 10) / 10,
            checked: checkedItems.includes(`batch-${meal.id}-${idx}`),
            source: "batch",
            mealId: meal.id
          });
        });
      }
    });
    return items;
  }, [selectedMealIds, mealServings, checkedItems]);

  const allItems = useMemo(() => {
    return [...batchItems, ...manualItems];
  }, [batchItems, manualItems]);

  const filteredItems = useMemo(() => {
    if (filterTab === "Remaining") return allItems.filter(item => !checkedItems.includes(item.id));
    if (filterTab === "In Cart") return allItems.filter(item => checkedItems.includes(item.id));
    if (filterTab === "From Batch") return allItems.filter(item => item.source === "batch");
    if (filterTab === "Manual") return allItems.filter(item => item.source === "manual");
    return allItems;
  }, [allItems, filterTab, checkedItems]);

  const summary = useMemo(() => {
    const total = allItems.length;
    const inCart = allItems.filter(item => checkedItems.includes(item.id)).length;
    const remaining = total - inCart;
    const mealsPrepped = selectedMealIds.length;
    return { total, inCart, remaining, mealsPrepped };
  }, [allItems, checkedItems, selectedMealIds]);

  const toggleItem = (id: string) => {
    setCheckedItems(prev =>
      prev.includes(id) ? prev.filter(iid => iid !== id) : [...prev, id]
    );
  };

  const addManualItem = () => {
    if (!newItemName.trim()) return;
    const newItem: ShoppingItem = {
      id: `manual-${Date.now()}`,
      name: newItemName,
      amount: 1,
      unit: "pc",
      category: "Pantry & Condiments",
      checked: false,
      source: "manual"
    };
    setManualItems(prev => [...prev, newItem]);
    setNewItemName("");
  };

  const deleteItem = (id: string) => {
    setManualItems(prev => prev.filter(item => item.id !== id));
    setCheckedItems(prev => prev.filter(iid => iid !== id));
  };

  const clearDone = () => {
    setManualItems(prev => prev.filter(item => !checkedItems.includes(item.id)));
    // For batch items, we just keep them but they remain checked
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-40 relative overflow-hidden">
      <AmbientBackground />

      {/* --- Header --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold font-syne">Shopping List</h1>
        </div>
        <button className="p-2 hover:bg-muted rounded-full transition-colors">
          <Share2 size={20} className="text-primary" />
        </button>
      </header>

      <main className="container max-w-lg mx-auto pt-24 px-6 space-y-6 relative z-10">
        {/* --- Summary Strip --- */}
        <div className="grid grid-cols-4 gap-2 bg-card/50 backdrop-blur-sm border border-border p-4 rounded-[24px]">
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Items</p>
            <p className="text-lg font-black font-syne">{summary.total}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">In Cart</p>
            <p className="text-lg font-black font-syne text-primary">{summary.inCart}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Remain</p>
            <p className="text-lg font-black font-syne">{summary.remaining}</p>
          </div>
          <div className="text-center border-l border-border/50">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meals</p>
            <p className="text-lg font-black font-syne">{summary.mealsPrepped}</p>
          </div>
        </div>

        {/* --- Filter Tabs --- */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {["All", "Remaining", "In Cart", "From Batch", "Manual"].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                filterTab === tab
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- Add Item Bar --- */}
        <div className="relative group">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addManualItem()}
            placeholder="Add manual item..."
            className="w-full h-12 bg-card border border-border rounded-2xl pl-4 pr-12 text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
          <button
            onClick={addManualItem}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary transition-colors hover:text-primary-foreground"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* --- Batch Cook Banner --- */}
        {selectedMealIds.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold">Auto-generated from Batch Cook</p>
              <p className="text-[10px] text-muted-foreground">
                {selectedMealIds.length} meals contributed {batchItems.length} items
              </p>
            </div>
          </div>
        )}

        {/* --- Categories --- */}
        <div className="space-y-4">
          {CATEGORIES.map(category => {
            const itemsInCat = filteredItems.filter(item => item.category === category);
            if (itemsInCat.length === 0 && filterTab !== "All") return null;
            if (itemsInCat.length === 0 && allItems.filter(i => i.category === category).length === 0) return null;

            const isCollapsed = collapsedCategories.includes(category);
            const checkedInCat = itemsInCat.filter(item => checkedItems.includes(item.id)).length;
            const progress = itemsInCat.length > 0 ? (checkedInCat / itemsInCat.length) * 100 : 0;

            return (
              <div key={category} className="bg-card/50 border border-border rounded-[24px] overflow-hidden">
                <div
                  onClick={() => toggleCategory(category)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <h3 className="text-sm font-bold font-syne">{category}</h3>
                    <Badge variant="outline" className="text-[10px] h-5">{itemsInCat.length}</Badge>
                    <div className="flex-1 max-w-[100px] h-1 bg-muted rounded-full overflow-hidden ml-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </div>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="px-4 pb-4 space-y-1">
                        {itemsInCat.length === 0 ? (
                          <p className="text-[10px] text-muted-foreground italic text-center py-2">No items here</p>
                        ) : (
                          itemsInCat.map(item => (
                            <div
                              key={item.id}
                              className="group flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  id={item.id}
                                  checked={checkedItems.includes(item.id)}
                                  onCheckedChange={() => toggleItem(item.id)}
                                  className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <label
                                  htmlFor={item.id}
                                  className={cn(
                                    "text-sm transition-all cursor-pointer",
                                    checkedItems.includes(item.id) ? "text-muted-foreground line-through" : "text-foreground font-medium"
                                  )}
                                >
                                  {item.name}
                                </label>
                                <span className="text-[10px] text-muted-foreground">
                                  {item.amount} {item.unit}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {item.source === "batch" ? (
                                  <Badge variant="secondary" className="text-[8px] h-4 px-1 uppercase font-black opacity-50">Batch</Badge>
                                ) : (
                                  <button
                                    onClick={() => deleteItem(item.id)}
                                    className="p-1 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- Bottom Bar --- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold">{summary.inCart} / {summary.total} Items</p>
            <p className="text-[10px] text-muted-foreground">in your cart</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearDone}
            className="rounded-xl border-border text-xs font-bold"
          >
            Clear done
          </Button>
          <Button
            size="sm"
            className="rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-bold gap-2"
          >
            <Share2 size={14} /> Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListPage;
