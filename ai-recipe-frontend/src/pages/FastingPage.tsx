import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  Play,
  Square,
  Zap,
  Info,
  ChevronRight,
  Flame,
  Clock,
  History,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePersistentState } from "@/hooks/use-dashboard-data";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const PROTOCOLS = [
  { name: "16:8", fast: 16, feed: 8, label: "Leangains" },
  { name: "18:6", fast: 18, feed: 6, label: "The Warrior" },
  { name: "20:4", fast: 20, feed: 4, label: "OMAD" },
  { name: "14:10", fast: 14, feed: 10, label: "Circadian" },
];

const FastingPage = () => {
  const [isFasting, setIsFasting] = usePersistentState<boolean>("fasting_active", false);
  const [startTime, setStartTime] = usePersistentState<string | null>("fasting_start_time", null);
  const [protocolIndex, setProtocolIndex] = usePersistentState<number>("fasting_protocol_idx", 0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const protocol = PROTOCOLS[protocolIndex];
  const targetSeconds = protocol.fast * 3600;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFasting && startTime) {
      const updateTimer = () => {
        const start = new Date(startTime).getTime();
        const now = new Date().getTime();
        setElapsedSeconds(Math.floor((now - start) / 1000));
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  const handleStart = () => {
    setIsFasting(true);
    setStartTime(new Date().toISOString());
  };

  const handleEnd = () => {
    if (confirm("End your fast now?")) {
      setIsFasting(false);
      setStartTime(null);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = Math.min((elapsedSeconds / targetSeconds) * 100, 100);

  // Determine metabolic stage
  const getStage = (seconds: number) => {
    const hrs = seconds / 3600;
    if (hrs < 2) return { name: "Blood Sugar Falling", color: "text-blue-400", desc: "Your body is processing your last meal." };
    if (hrs < 12) return { name: "Fat Burning", color: "text-[#c8f560]", desc: "Insulin levels have dropped, fat oxidation begins." };
    if (hrs < 14) return { name: "Ketosis", color: "text-orange-400", desc: "The liver starts producing ketones for energy." };
    return { name: "Autophagy", color: "text-purple-400", desc: "Cellular cleanup and regeneration is peaking." };
  };

  const stage = getStage(elapsedSeconds);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-32">
      <Header />

      <main className="container max-w-lg mx-auto pt-24 px-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-syne">Fasting Tracker</h1>
          <p className="text-sm text-white/40">Optimize your metabolic health</p>
        </div>

        {/* --- Timer Ring --- */}
        <div className="relative flex flex-col items-center py-4">
          <div className="relative w-72 h-72 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="144"
                cy="144"
                r="134"
                fill="transparent"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
              />
              <motion.circle
                cx="144"
                cy="144"
                r="134"
                fill="transparent"
                stroke={isFasting ? "#c8f560" : "rgba(255,255,255,0.1)"}
                strokeWidth="10"
                strokeDasharray={842}
                initial={{ strokeDashoffset: 842 }}
                animate={{ strokeDashoffset: 842 - (842 * percentage) / 100 }}
                strokeLinecap="round"
                className="drop-shadow-[0_0_15px_rgba(200,245,96,0.3)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-2">
                {isFasting ? "Currently Fasting" : "Ready to Start"}
              </span>
              <span className="text-5xl font-black font-syne tabular-nums">
                {formatTime(elapsedSeconds)}
              </span>
              <div className="mt-4 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-white/60">Target: {protocol.name}</span>
                <div className="flex gap-1 h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#c8f560]" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Controls --- */}
        <div className="flex justify-center">
          {!isFasting ? (
            <Button
              onClick={handleStart}
              className="h-16 px-12 rounded-[24px] bg-[#c8f560] hover:bg-[#b8e550] text-black font-black text-lg shadow-[0_0_20px_rgba(200,245,96,0.3)]"
            >
              <Play className="w-6 h-6 mr-2 fill-current" />
              START FAST
            </Button>
          ) : (
            <Button
              onClick={handleEnd}
              variant="outline"
              className="h-16 px-12 rounded-[24px] border-[0.5px] border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-lg"
            >
              <Square className="w-6 h-6 mr-2 fill-current" />
              END FAST
            </Button>
          )}
        </div>

        {/* --- Metabolic Stage Card --- */}
        <AnimatePresence>
          {isFasting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/5 border-[0.5px] border-white/10 rounded-[24px] p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Flame className={cn("w-5 h-5", stage.color)} />
                  </div>
                  <div>
                    <h3 className="font-bold font-syne">Current Phase</h3>
                    <p className={cn("text-xs font-bold uppercase tracking-wider", stage.color)}>
                      {stage.name}
                    </p>
                  </div>
                </div>
                <Info className="w-4 h-4 text-white/20" />
              </div>
              <p className="text-sm text-white/60 leading-relaxed font-dm-sans">
                {stage.desc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Protocol Selector --- */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 px-2">Choose Protocol</h3>
          <div className="grid grid-cols-2 gap-3">
            {PROTOCOLS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setProtocolIndex(i)}
                className={cn(
                  "p-4 rounded-[24px] border-[0.5px] text-left transition-all duration-300",
                  protocolIndex === i
                    ? "bg-white/10 border-[#c8f560]/50 shadow-[0_0_15px_rgba(200,245,96,0.1)]"
                    : "bg-white/5 border-white/10 opacity-60"
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-lg font-black font-syne">{p.name}</span>
                  {protocolIndex === i && <Zap className="w-4 h-4 text-[#c8f560] fill-current" />}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{p.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* --- Insights & History --- */}
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white/5 border-[0.5px] border-white/10 rounded-[24px] p-6 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#c8f560]/10 flex items-center justify-center">
                <History className="w-5 h-5 text-[#c8f560]" />
              </div>
              <div>
                <h4 className="font-bold font-syne">Fasting History</h4>
                <p className="text-xs text-white/40">7 day streak • Total 112h</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20 group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="bg-[#c8f560]/10 border-[0.5px] border-[#c8f560]/20 rounded-[24px] p-5 flex gap-4 items-start">
            <AlertCircle className="w-5 h-5 text-[#c8f560] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#c8f560]">AI Insight</h4>
              <p className="text-xs text-[#c8f560]/80 leading-relaxed font-dm-sans">
                You typically feel hungry at the 12-hour mark. Try drinking some sparkling water then to stay on track.
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default FastingPage;
