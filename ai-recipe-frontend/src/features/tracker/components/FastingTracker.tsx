import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

interface FastingTrackerProps {
  protocol: string;
  startTime: string;
  totalHours: number;
}

const FastingTracker = ({ protocol, startTime, totalHours }: FastingTrackerProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const update = () => {
      const now = new Date().getTime();
      setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const percentage = Math.min((elapsedSeconds / (totalHours * 3600)) * 100, 100);
  const circumference = 2 * Math.PI * 40;

  return (
    <Link to="/tracker" className="block">
      <div className="glass-card p-6 space-y-4 hover:bg-card/60 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Timer className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-bold font-syne">Fasting</h3>
          </div>
          <div className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-lg border border-purple-500/20">
            {protocol}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-muted"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (percentage / 100) * circumference}
                className="text-purple-500"
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold font-syne tracking-tight">
              {hours}h {minutes}m
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Time Fasted</p>
            <p className="text-[10px] text-purple-400/80 font-bold mt-2">
              Goal: {totalHours}h
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FastingTracker;
