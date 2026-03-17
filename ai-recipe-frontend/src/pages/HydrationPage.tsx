import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplet,
  Plus,
  Minus,
  ChevronLeft,
  Bot,
  Send,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  Calendar,
  Bell,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { askClaude } from "@/lib/claude";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

interface AIInsight {
  title: string;
  description: string;
  badge: string;
}

const HydrationPage = () => {
  const { state, setWater, setGoals, updateWeeklyWater, setNotificationPrefs } = useApp();
  const { requestPermission } = useNotifications();
  // --- State ---
  const intake = state.today.waterMl;
  const goal = state.goals.water;
  const cupsCount = state.today.cupsFilledCount;
  const [history, setHistory] = useState<any[]>([]);

  const [aiNudge, setAiNudge] = useState("Analyzing your hydration patterns...");
  const [aiGoalInfo, setAiGoalInfo] = useState({ adjusted: 2500, reason: "Log some water to get AI personalized goals." });
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: "assistant", content: "Hi! I'm your AI hydration coach. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const remindersEnabled = state.notifications.waterRemindersOn;
  const reminderInterval = state.notifications.waterIntervalMinutes;

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const percentage = Math.min((intake / goal) * 100, 100);
  const apiUrl = import.meta.env.VITE_API_URL || "https://ai-recipe-finder-gfdv.onrender.com";

  const addWater = (amount: number) => {
    const newIntake = intake + amount;
    setWater(newIntake);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory(prev => [{ time: timeStr, amount }, ...prev].slice(0, 20));
    updateWeeklyWater("Sun", newIntake); // Simplified: update current day
  };

  const toggleCup = (index: number) => {
    const wasFilled = index < cupsCount;
    if (wasFilled) {
      setWater(Math.max(0, intake - 250), cupsCount - 1);
    } else {
      setWater(intake + 250, cupsCount + 1);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistory(prev => [{ time: timeStr, amount: 250 }, ...prev].slice(0, 20));
    }
  };

  // --- AI Integrations ---
  useEffect(() => {
    const fetchAI = async () => {
      try {
        const nudge = await askClaude(
          "You are a hydration coach inside a nutrition app. Be concise, friendly, and data-driven. Provide a single-sentence nudge based on the user's intake.",
          `User intake: ${intake}ml. Goal: ${goal}ml. Time: afternoon. Weather: Sunny, 28°C.`
        );
        setAiNudge(nudge);

        if (history.length > 0) {
          const goalPred = await askClaude(
            "You are a hydration expert. Analyze the user's water history and suggest a daily goal. Return ONLY JSON: { \"goal\": number, \"reason\": string }",
            `History: ${JSON.stringify(history)}`
          );
          const data = JSON.parse(goalPred);
          setAiGoalInfo({ adjusted: data.goal, reason: data.reason });
          setGoals({ water: data.goal });

          const insightsJson = await askClaude(
            "You are a nutrition analyst. Return ONLY a JSON array of 4 insight objects: [{ \"title\": string, \"description\": string, \"badge\": string }]. Be specific and data-driven.",
            `User's weekly data: ${JSON.stringify(state.weeklyWater)}`
          );
          setAiInsights(JSON.parse(insightsJson));
        }
      } catch (err) {
        console.error("AI Fetch Error:", err);
      }
    };
    fetchAI();
  }, [history.length, intake, goal]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput;
    const userMsg = { role: "user", content: userMessage };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setIsSending(true);

    try {
      const reply = await askClaude(
        "You are a hydration coach inside a nutrition app. Be concise, friendly, and data-driven. Only answer questions about hydration, water intake, and healthy habits.",
        userMessage
      );
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting right now, but remember to keep sipping water!" }]);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <Header />

      <main className="container max-w-lg mx-auto pt-24 px-6 space-y-8">
        {/* --- AI Coach Banner --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-[24px] p-5 flex gap-4 items-start"
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Coach</span>
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            </div>
            <p className="text-sm font-dm-sans leading-relaxed text-foreground italic">
              "{aiNudge}"
            </p>
          </div>
        </motion.div>

        {/* --- Hero Ring --- */}
        <div className="relative flex flex-col items-center py-4">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="118"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="12"
                className="text-border"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="118"
                fill="transparent"
                stroke="#4fc3f7"
                strokeWidth="12"
                strokeDasharray={741}
                initial={{ strokeDashoffset: 741 }}
                animate={{ strokeDashoffset: 741 - (741 * percentage) / 100 }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_rgba(79,195,247,0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Droplet className="w-8 h-8 text-[#4fc3f7] mb-2 fill-current" />
              <span className="text-5xl font-bold font-syne">{intake}</span>
              <span className="text-sm text-muted-foreground uppercase tracking-widest font-bold">ml logged</span>
            </div>
          </div>

          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center gap-2 bg-muted border border-border px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-muted-foreground">
                AI adjusted goal: <span className="text-foreground">{goal}ml</span>
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground italic max-w-[200px]">
              "{aiGoalInfo.reason}"
            </p>
          </div>
        </div>

        {/* --- Cups Grid --- */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Daily Tracker</h3>
            <span className="text-xs font-medium text-muted-foreground">{cupsCount} / 8 glasses</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array(8).fill(0).map((_, i) => {
              const filled = i < cupsCount;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleCup(i)}
                  className={cn(
                    "h-16 rounded-[20px] flex items-center justify-center transition-all duration-300 border-[0.5px]",
                    filled
                      ? "bg-[#4fc3f7]/20 border-[#4fc3f7]/50 text-[#4fc3f7] shadow-[0_0_20px_rgba(79,195,247,0.2)]"
                      : "bg-muted border-border text-muted-foreground/30"
                  )}
                >
                  <Droplet className={cn("w-7 h-7", filled && "fill-current")} />
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* --- Add Water Buttons --- */}
        <section className="grid grid-cols-2 gap-3">
          {[150, 250, 500, 750].map((amount) => (
            <Button
              key={amount}
              onClick={() => addWater(amount)}
              variant="outline"
              className="h-16 rounded-[24px] border-[0.5px] border-border bg-card hover:bg-accent hover:text-accent-foreground text-lg font-bold font-syne text-foreground"
            >
              <Plus className="w-4 h-4 mr-2 text-[#4fc3f7]" />
              {amount}ml
            </Button>
          ))}
        </section>

        {/* --- AI Insights Card --- */}
        <section className="bg-card border-[0.5px] border-border rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold font-syne text-lg">AI Insights</h3>
          </div>
          <div className="space-y-4">
            {aiInsights.length > 0 ? aiInsights.map((insight, i) => (
              <div key={i} className="space-y-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold font-syne">{insight.title}</h4>
                  <Badge variant="secondary" className="text-[8px] font-black uppercase bg-primary/10 text-primary">
                    {insight.badge}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-tight">{insight.description}</p>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground italic text-center py-4">Start tracking to unlock insights</p>
            )}
          </div>
        </section>

        {/* --- Hourly Timeline --- */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Hourly Timeline</h3>
            <Clock className="w-4 h-4 text-muted-foreground/20" />
          </div>
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[0.5px] before:bg-border">
            {history.length === 0 && (
              <p className="text-xs text-muted-foreground italic py-4">No data yet</p>
            )}
            {history.map((log, i) => (
              <div key={i} className="relative flex items-center gap-4">
                <div className="absolute -left-[19px] w-2.5 h-2.5 rounded-full bg-[#4fc3f7] border-[2px] border-background z-10" />
                <span className="text-[10px] font-bold text-muted-foreground w-10">{log.time}</span>
                <div className="flex-1 bg-card border-[0.5px] border-border rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs font-medium">Logged {log.amount}ml</span>
                  <Check className="w-3 h-3 text-primary" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Weekly Progress --- */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Weekly History</h3>
            <Calendar className="w-4 h-4 text-muted-foreground/20" />
          </div>
          <div className="bg-card border-[0.5px] border-border rounded-[24px] p-6 relative">
            <div className="flex items-end justify-between h-32 gap-2">
              {state.weeklyWater.map((item, i) => {
                const val = Math.min(100, (item.ml / goal) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full relative bg-muted rounded-t-lg overflow-hidden h-24">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        className={cn(
                          "absolute bottom-0 left-0 right-0",
                          val >= 90 ? "bg-primary" : "bg-[#4fc3f7]"
                        )}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {item.day[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- Reminders --- */}
        <section className="bg-card border-[0.5px] border-border rounded-[24px] p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold font-syne">Reminders</h3>
              <div className="px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded tracking-tighter">AI Auto</div>
            </div>
            <p className="text-xs text-muted-foreground">Optimized for your 3PM slump</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[30, 60, 90].map(m => (
                <button
                  key={m}
                  onClick={() => setNotificationPrefs({ waterIntervalMinutes: m })}
                  className={cn(
                    "w-8 h-8 rounded-lg text-[10px] font-bold border-[0.5px] transition-all",
                    reminderInterval === m
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-muted border-border text-muted-foreground"
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>
            <button
              onClick={async () => {
                if (!remindersEnabled && Notification.permission !== 'granted') {
                  const granted = await requestPermission();
                  if (!granted) return;
                }
                setNotificationPrefs({ waterRemindersOn: !remindersEnabled });
              }}
              className={cn(
                "w-12 h-6 rounded-full relative transition-colors duration-300",
                remindersEnabled ? "bg-primary" : "bg-muted"
              )}
            >
              <motion.div
                animate={{ x: remindersEnabled ? 26 : 2 }}
                className="absolute top-1 left-0 w-4 h-4 bg-foreground rounded-full shadow-lg"
              />
            </button>
          </div>
        </section>
      </main>

      {/* --- AI Chat Bubble & Panel --- */}
      <div className="fixed bottom-24 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-[320px] h-[450px] bg-card border border-border rounded-[24px] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-syne">HydraCoach</h4>
                    <span className="text-[10px] text-primary/80">Claude 3.5 Sonnet</span>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed",
                    msg.role === "assistant"
                      ? "bg-muted text-foreground rounded-tl-none self-start"
                      : "bg-primary text-primary-foreground border border-primary/30 rounded-tr-none ml-auto"
                  )}>
                    {msg.content}
                  </div>
                ))}
                {isSending && (
                  <div className="bg-muted text-muted-foreground p-3 rounded-2xl rounded-tl-none self-start flex gap-1 items-center">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted border-t border-border">
                <div className="relative">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about your goal..."
                    className="w-full bg-background border border-border rounded-xl py-2.5 pl-4 pr-10 text-xs focus:outline-none focus:border-blue-500/50 text-foreground"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 disabled:text-muted-foreground"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors",
            isChatOpen ? "bg-foreground text-background" : "bg-blue-500 text-white"
          )}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          {!isChatOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background animate-pulse" />
          )}
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
};

export default HydrationPage;
