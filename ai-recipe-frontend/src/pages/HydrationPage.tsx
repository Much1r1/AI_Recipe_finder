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
import { usePersistentState } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const HydrationPage = () => {
  // --- State ---
  const [intake, setIntake] = usePersistentState<number>("water_intake_ml", 1250);
  const [goal, setGoal] = usePersistentState<number>("water_goal_ml", 2500);
  const [cups, setCups] = usePersistentState<boolean[]>("hydration_cups_grid", Array(8).fill(false).map((_, i) => i < 4));
  const [history, setHistory] = usePersistentState<any[]>("water_history_log", [
    { time: "08:00", amount: 250 },
    { time: "10:30", amount: 500 },
    { time: "13:00", amount: 250 },
    { time: "15:00", amount: 250 },
  ]);

  const [aiNudge, setAiNudge] = useState("Analyzing your hydration patterns...");
  const [aiGoalInfo, setAiGoalInfo] = useState({ adjusted: 2500, reason: "Loading AI prediction..." });
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: "assistant", content: "Hi! I'm your AI hydration coach. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderInterval, setReminderInterval] = useState(60);

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const percentage = Math.min((intake / goal) * 100, 100);
  const apiUrl = import.meta.env.VITE_API_URL || "https://ai-recipe-finder-gfdv.onrender.com";

  const addWater = (amount: number) => {
    setIntake(prev => prev + amount);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory(prev => [{ time: timeStr, amount }, ...prev].slice(0, 20));

    // Auto-fill cups based on 250ml units
    const totalFilled = Math.floor((intake + amount) / 250);
    const newCups = cups.map((_, i) => i < totalFilled);
    setCups(newCups);
  };

  const toggleCup = (index: number) => {
    const newCups = [...cups];
    const wasFilled = newCups[index];
    newCups[index] = !wasFilled;
    setCups(newCups);

    if (wasFilled) {
      setIntake(prev => Math.max(0, prev - 250));
    } else {
      setIntake(prev => prev + 250);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistory(prev => [{ time: timeStr, amount: 250 }, ...prev].slice(0, 20));
    }
  };

  // --- AI Integrations ---
  useEffect(() => {
    // 1. Fetch AI Nudge
    fetch(`${apiUrl}/api/v1/tracker/hydration/coach?intake=${intake}&time_of_day=afternoon&weather=Sunny, 28°C`)
      .then(res => res.json())
      .then(data => setAiNudge(data.nudge))
      .catch(() => setAiNudge("Stay focused! You're 50% through your daily goal. Drink a glass now."));

    // 2. Fetch AI Goal Prediction
    fetch(`${apiUrl}/api/v1/tracker/hydration/goal-prediction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(history)
    })
      .then(res => res.json())
      .then(data => {
        setAiGoalInfo(data);
        setGoal(data.goal);
      })
      .catch(() => setAiGoalInfo({ adjusted: 2500, reason: "Based on your typical active day." }));

    // 3. Fetch AI Insights
    fetch(`${apiUrl}/api/v1/tracker/hydration/insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(history)
    })
      .then(res => res.json())
      .then(data => setAiInsights(data.insights))
      .catch(() => setAiInsights([
        "Intake is 15% higher than this time last Tuesday.",
        "You typically experience a 'slump' window at 3:00 PM.",
        "Predicted goal for tomorrow: 2,750ml (Heatwave expected).",
        "Adding 250ml after your 6 PM window could improve sleep quality."
      ]));
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMsg = { role: "user", content: userInput };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setIsSending(true);

    try {
      const res = await fetch(`${apiUrl}/api/v1/tracker/hydration/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userInput,
          history: history,
          weather: "Sunny, 28°C"
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm offline. Just keep sipping!" }]);
    } finally {
      setIsSending(false);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-32">
      <Header />

      <main className="container max-w-lg mx-auto pt-24 px-6 space-y-8">
        {/* --- AI Coach Banner --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-[24px] p-5 flex gap-4 items-start"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">AI Coach</span>
              <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
            </div>
            <p className="text-sm font-dm-sans leading-relaxed text-blue-100/80 italic">
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
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="12"
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
              <span className="text-sm text-white/40 uppercase tracking-widest font-bold">ml logged</span>
            </div>
          </div>

          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#c8f560]" />
              <span className="text-xs font-bold text-white/60">
                AI adjusted goal: <span className="text-white">{goal}ml</span>
              </span>
            </div>
            <p className="text-[10px] text-white/30 italic max-w-[200px]">
              "{aiGoalInfo.reason}"
            </p>
          </div>
        </div>

        {/* --- Cups Grid --- */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Daily Tracker</h3>
            <span className="text-xs font-medium text-white/60">{Math.floor(intake/250)} / 8 glasses</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {cups.map((filled, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleCup(i)}
                className={cn(
                  "h-16 rounded-[20px] flex items-center justify-center transition-all duration-300 border-[0.5px]",
                  filled
                    ? "bg-[#4fc3f7]/20 border-[#4fc3f7]/50 text-[#4fc3f7] shadow-[0_0_20px_rgba(79,195,247,0.2)]"
                    : "bg-white/5 border-white/10 text-white/20"
                )}
              >
                <Droplet className={cn("w-7 h-7", filled && "fill-current")} />
              </motion.button>
            ))}
          </div>
        </section>

        {/* --- Add Water Buttons --- */}
        <section className="grid grid-cols-2 gap-3">
          {[150, 250, 500, 750].map((amount) => (
            <Button
              key={amount}
              onClick={() => addWater(amount)}
              variant="outline"
              className="h-16 rounded-[24px] border-[0.5px] border-white/10 bg-white/5 hover:bg-white/10 text-lg font-bold font-syne"
            >
              <Plus className="w-4 h-4 mr-2 text-[#4fc3f7]" />
              {amount}ml
            </Button>
          ))}
        </section>

        {/* --- AI Insights Card --- */}
        <section className="bg-white/5 border-[0.5px] border-white/10 rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#c8f560]" />
            <h3 className="font-bold font-syne text-lg">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {aiInsights.map((insight, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <div className="w-1.5 h-1.5 rounded-full bg-[#c8f560] mt-1.5 group-hover:scale-150 transition-transform" />
                <p className="text-sm text-white/60 leading-tight">{insight}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- Hourly Timeline --- */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Hourly Timeline</h3>
            <Clock className="w-4 h-4 text-white/20" />
          </div>
          <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[0.5px] before:bg-white/10">
            {history.map((log, i) => (
              <div key={i} className="relative flex items-center gap-4">
                <div className="absolute -left-[19px] w-2.5 h-2.5 rounded-full bg-[#4fc3f7] border-[2px] border-[#0a0a0f] z-10" />
                <span className="text-[10px] font-bold text-white/40 w-10">{log.time}</span>
                <div className="flex-1 bg-white/5 border-[0.5px] border-white/10 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs font-medium">Logged {log.amount}ml</span>
                  <Check className="w-3 h-3 text-[#c8f560]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Weekly Progress --- */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Weekly History</h3>
            <Calendar className="w-4 h-4 text-white/20" />
          </div>
          <div className="bg-white/5 border-[0.5px] border-white/10 rounded-[24px] p-6">
            <div className="flex items-end justify-between h-32 gap-2">
              {[60, 85, 40, 100, 70, 90, 45].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative bg-white/5 rounded-t-lg overflow-hidden h-24">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      className={cn(
                        "absolute bottom-0 left-0 right-0",
                        val >= 90 ? "bg-[#c8f560]" : "bg-[#4fc3f7]"
                      )}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white/30">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Reminders --- */}
        <section className="bg-white/5 border-[0.5px] border-white/10 rounded-[24px] p-6 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold font-syne">Reminders</h3>
              <div className="px-1.5 py-0.5 bg-[#c8f560]/20 text-[#c8f560] text-[8px] font-black uppercase rounded tracking-tighter">AI Auto</div>
            </div>
            <p className="text-xs text-white/40">Optimized for your 3PM slump</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[30, 60, 90].map(m => (
                <button
                  key={m}
                  onClick={() => setReminderInterval(m)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-[10px] font-bold border-[0.5px] transition-all",
                    reminderInterval === m
                      ? "bg-[#c8f560] border-[#c8f560] text-black"
                      : "bg-white/5 border-white/10 text-white/40"
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>
            <button
              onClick={() => setRemindersEnabled(!remindersEnabled)}
              className={cn(
                "w-12 h-6 rounded-full relative transition-colors duration-300",
                remindersEnabled ? "bg-[#c8f560]" : "bg-white/10"
              )}
            >
              <motion.div
                animate={{ x: remindersEnabled ? 26 : 2 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
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
              className="absolute bottom-20 right-0 w-[320px] h-[450px] bg-[#1a1a24] border border-white/10 rounded-[24px] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-syne">HydraCoach</h4>
                    <span className="text-[10px] text-blue-400/80">Claude 3.5 Sonnet</span>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed",
                    msg.role === "assistant"
                      ? "bg-white/5 text-white/80 rounded-tl-none self-start"
                      : "bg-blue-500/20 text-blue-100 border border-blue-500/30 rounded-tr-none ml-auto"
                  )}>
                    {msg.content}
                  </div>
                ))}
                {isSending && (
                  <div className="bg-white/5 text-white/40 p-3 rounded-2xl rounded-tl-none self-start flex gap-1 items-center">
                    <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              <div className="p-4 bg-white/5 border-t border-white/10">
                <div className="relative">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about your goal..."
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-xs focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 disabled:text-white/20"
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
            isChatOpen ? "bg-white text-black" : "bg-blue-500 text-white"
          )}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          {!isChatOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#c8f560] rounded-full border-2 border-[#0a0a0f] animate-pulse" />
          )}
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
};

export default HydrationPage;
