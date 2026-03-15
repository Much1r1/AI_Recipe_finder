import { useState, useEffect } from "react";

export interface DashboardData {
  calories: {
    consumed: number;
    goal: number;
  };
  macros: {
    protein: { current: number; goal: number };
    carbs: { current: number; goal: number };
    fats: { current: number; goal: number };
  };
  fasting: {
    protocol: string;
    startTime: string; // ISO string
    totalHours: number;
  };
  meals: Array<{
    id: number;
    name: string;
    kcal: number;
    protein: string;
    emoji: string;
  }>;
}

const DEFAULT_DATA: DashboardData = {
  calories: { consumed: 1450, goal: 2200 },
  macros: {
    protein: { current: 82, goal: 150 },
    carbs: { current: 145, goal: 250 },
    fats: { current: 42, goal: 70 },
  },
  fasting: {
    protocol: "16:8",
    startTime: new Date(new Date().getTime() - 12.5 * 60 * 60 * 1000).toISOString(),
    totalHours: 16,
  },
  meals: [
    { id: 1, name: "Berry Oatmeal", kcal: 320, protein: "12g", emoji: "🥣" },
    { id: 2, name: "Grilled Salmon", kcal: 540, protein: "42g", emoji: "🐟" },
    { id: 3, name: "Quinoa Bowl", kcal: 410, protein: "18g", emoji: "🥗" },
  ],
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "https://ai-recipe-finder-gfdv.onrender.com";
        // Attempt to fetch from real endpoints if available, otherwise fallback
        const res = await fetch(`${apiUrl}/api/v1/tracker/summary`).catch(() => null);
        if (res && res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.warn("Dashboard data fetch failed, using defaults:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading };
};

// Hook for persistent local state
export const usePersistentState = <T,>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
};
