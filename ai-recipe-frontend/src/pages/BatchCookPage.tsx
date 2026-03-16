import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Users,
  Utensils,
  Calendar,
  ChefHat
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePersistentState } from "@/hooks/use-dashboard-data";
import { MOCK_MEALS, Meal } from "@/data/batch-cook-data";
import AmbientBackground from "@/components/AmbientBackground";

const DAYS = ["All Week", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const BatchCookPage = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState("All Week");
  const [selectedMealIds, setSelectedMealIds] = usePersistentState<string[]>("batch_selected_ids", []);
  const [mealServings, setMealServings] = usePersistentState<Record<string, number>>("batch_meal_servings", {});
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);

  // Correctly initialize servings using useEffect
  useEffect(() => {
    const newServings = { ...mealServings };
    let changed = false;
    MOCK_MEALS.forEach(meal => {
      if (newServings[meal.id] === undefined) {
        newServings[meal.id] = meal.servings;
        changed = true;
      }
    });
    if (changed) {
      setMealServings(newServings);
    }
  }, []); // Only on mount

  const filteredMeals = useMemo(() => {
    if (selectedDay === "All Week") return MOCK_MEALS;
    return MOCK_MEALS.filter(meal => meal.days.includes(selectedDay));
  }, [selectedDay]);

  const selectedMeals = useMemo(() => {
    return MOCK_MEALS.filter(m => selectedMealIds.includes(m.id));
  }, [selectedMealIds]);

  const summary = useMemo(() => {
    return selectedMeals.reduce(
      (acc, meal) => {
        const servings = mealServings[meal.id] || meal.servings;
        const multiplier = servings / meal.servings;
        acc.meals += 1;
        acc.time += meal.cookTime;
        acc.servings += servings;
        acc.kcal += Math.round(meal.kcal * multiplier);
        return acc;
      },
      { meals: 0, time: 0, servings: 0, kcal: 0 }
    );
  }, [selectedMeals, mealServings]);

  const toggleMealSelection = (id: string) => {
    setSelectedMealIds(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const adjustServings = (id: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMealServings(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMealId(expandedMealId === id ? null : id);
  };

  const handleGenerateShoppingList = () => {
    navigate("/shopping-list");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 relative overflow-hidden">
      <AmbientBackground />

      {/* --- Header --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold font-syne">Batch Cook</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary font-bold gap-2"
          onClick={() => navigate("/shopping-list")}
        >
          Shopping List <ArrowRight size={16} />
        </Button>
      </header>

      <main className="container max-w-lg mx-auto pt-24 px-6 space-y-8 relative z-10">
        {/* --- Summary Strip --- */}
        <div className="grid grid-cols-4 gap-2 bg-card/50 backdrop-blur-sm border border-border p-4 rounded-[24px]">
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meals</p>
            <p className="text-lg font-black font-syne">{summary.meals}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Time</p>
            <p className="text-lg font-black font-syne">{summary.time}m</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Servings</p>
            <p className="text-lg font-black font-syne">{summary.servings}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kcal</p>
            <p className="text-lg font-black font-syne">{summary.kcal}</p>
          </div>
        </div>

        {/* --- Day Tabs --- */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                selectedDay === day
                  ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50"
              )}
            >
              {day}
            </button>
          ))}
        </div>

        {/* --- Meals List --- */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Utensils size={14} />
            Available Recipes
          </h3>

          <div className="space-y-3">
            {filteredMeals.map((meal) => {
              const isSelected = selectedMealIds.includes(meal.id);
              const isExpanded = expandedMealId === meal.id;
              const servings = mealServings[meal.id] || meal.servings;

              return (
                <motion.div
                  key={meal.id}
                  layout
                  onClick={() => toggleMealSelection(meal.id)}
                  className={cn(
                    "bg-card border-[0.5px] rounded-[24px] overflow-hidden cursor-pointer transition-all",
                    isSelected ? "border-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]" : "border-border"
                  )}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="text-3xl">{meal.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold font-syne truncate">{meal.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                          <Clock size={10} /> {meal.cookTime}m
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                          <Flame size={10} /> {meal.kcal} kcal
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => toggleExpand(meal.id, e)}
                        className="p-2 hover:bg-muted rounded-full transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-muted border-border text-muted-foreground/30"
                        )}
                      >
                        <Check size={16} className={cn(isSelected ? "opacity-100" : "opacity-0")} />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border bg-muted/30"
                      >
                        <div className="p-5 space-y-6">
                          <Badge variant="secondary" className="text-[10px] uppercase font-black">
                            {meal.dietaryTags.join(" • ")}
                          </Badge>

                          {/* Servings Adjuster */}
                          <div className="flex items-center justify-between bg-card p-3 rounded-2xl border border-border">
                            <span className="text-xs font-bold flex items-center gap-2">
                              <Users size={14} className="text-primary" />
                              Servings
                            </span>
                            <div className="flex items-center gap-4">
                              <button
                                onClick={(e) => adjustServings(meal.id, -1, e)}
                                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-black font-syne w-4 text-center">{servings}</span>
                              <button
                                onClick={(e) => adjustServings(meal.id, 1, e)}
                                className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Ingredients */}
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ingredients</h5>
                            <div className="grid grid-cols-1 gap-2">
                              {meal.ingredients.map((ing, idx) => {
                                const multiplier = servings / meal.servings;
                                return (
                                  <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="text-foreground/80">{ing.name}</span>
                                    <span className="font-bold">
                                      {Math.round(ing.amount * multiplier * 10) / 10} {ing.unit}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Steps */}
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cook Steps</h5>
                            <div className="space-y-3">
                              {meal.steps.map((step, idx) => (
                                <div key={idx} className="flex gap-3">
                                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Add Custom Meal */}
            <button className="w-full h-20 border-2 border-dashed border-border rounded-[24px] flex items-center justify-center gap-3 text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-all group">
              <div className="w-8 h-8 rounded-full border border-dashed border-muted-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={18} />
              </div>
              <span className="text-sm font-bold font-syne">Add custom meal</span>
            </button>
          </div>
        </div>

        {/* --- Cook Order Timeline --- */}
        {selectedMeals.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ChefHat size={14} />
              Suggested Cook Order
            </h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[0.5px] before:bg-border">
              {selectedMeals.map((meal, idx) => {
                const isDone = idx < 0; // Mock logic: none done yet for simplicity, but structure allows it
                const isActive = idx === 0;

                return (
                  <div key={meal.id} className="relative flex items-center gap-4">
                    <div className={cn(
                      "absolute -left-[19px] w-2.5 h-2.5 rounded-full border-[2px] border-background z-10",
                      isActive ? "bg-primary animate-pulse" : (isDone ? "bg-green-500" : "bg-muted")
                    )} />
                    <div className={cn(
                      "flex-1 border-[0.5px] rounded-xl p-3 flex justify-between items-center",
                      isActive ? "bg-card border-primary/50" : "bg-card/50 border-border"
                    )}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{meal.emoji}</span>
                        <div>
                          <p className="text-xs font-bold">{meal.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {isActive ? "Active • 25m left" : (isDone ? "Completed" : "Upcoming")}
                          </p>
                        </div>
                      </div>
                      {isActive && <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-none text-[8px] font-black uppercase">Now</Badge>}
                      {isDone && <Check size={12} className="text-green-500" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="h-20" /> {/* Spacer */}
      </main>

      {/* --- CTA Button --- */}
      <div className="fixed bottom-10 left-0 right-0 px-6 z-50 flex justify-center">
        <Button
          onClick={handleGenerateShoppingList}
          disabled={selectedMealIds.length === 0}
          className="w-full max-w-md h-14 rounded-[20px] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/20"
        >
          Generate Shopping List
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default BatchCookPage;
