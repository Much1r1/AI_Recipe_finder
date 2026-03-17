import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  name: string;
  avatar: string;
  streak: number;
  joinDate: string;
  plan: string;
}

export interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
}

export interface MealEntry {
  id: string | number;
  name: string;
  kcal: number;
  protein: number | string;
  carbs: number | string;
  fats: number | string;
  emoji: string;
  time: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: string;
  checked: boolean;
  source: "batch" | "manual";
}

export interface NotificationPrefs {
  permissionGranted: boolean;
  waterRemindersOn: boolean;
  waterIntervalMinutes: number;
  mealRemindersOn: boolean;
  pushSubscription: any | null;
}

export interface AppState {
  user: User;
  goals: Goals;
  today: {
    caloriesConsumed: number;
    waterMl: number;
    meals: MealEntry[];
    fastingStart: string;
    cupsFilledCount: number;
  };
  shoppingList: ShoppingItem[];
  batchMeals: string[]; // IDs of selected meals
  recentScans: any[];
  weeklyWater: { day: string; ml: number }[];
  notifications: NotificationPrefs;
}

interface AppContextType {
  state: AppState;
  setUser: (user: Partial<User>) => void;
  setGoals: (goals: Partial<Goals>) => void;
  addMeal: (meal: MealEntry) => void;
  setWater: (ml: number, cups?: number) => void;
  setFastingStart: (isoDate: string) => void;
  setShoppingList: (list: ShoppingItem[]) => void;
  toggleShoppingItem: (id: string) => void;
  setBatchMeals: (mealIds: string[]) => void;
  addRecentScan: (scan: any) => void;
  updateWeeklyWater: (day: string, ml: number) => void;
  setNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
}

const DEFAULT_STATE: AppState = {
  user: {
    name: "Sarah Muchiri",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
    streak: 12,
    joinDate: "Jan 2024",
    plan: "Pro"
  },
  goals: {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fats: 70,
    water: 2500
  },
  today: {
    caloriesConsumed: 1450,
    waterMl: 750,
    meals: [
      { id: 1, name: "Berry Oatmeal", kcal: 320, protein: 12, carbs: 45, fats: 8, emoji: "🥣", time: "08:30 AM" },
      { id: 2, name: "Grilled Salmon", kcal: 540, protein: 42, carbs: 0, fats: 22, emoji: "🐟", time: "01:15 PM" },
    ],
    fastingStart: new Date(new Date().getTime() - 12.5 * 60 * 60 * 1000).toISOString(),
    cupsFilledCount: 3
  },
  shoppingList: [],
  batchMeals: [],
  recentScans: [],
  weeklyWater: [
    { day: "Mon", ml: 2100 },
    { day: "Tue", ml: 2400 },
    { day: "Wed", ml: 1800 },
    { day: "Thu", ml: 2500 },
    { day: "Fri", ml: 2200 },
    { day: "Sat", ml: 1500 },
    { day: "Sun", ml: 750 },
  ],
  notifications: {
    permissionGranted: false,
    waterRemindersOn: true,
    waterIntervalMinutes: 60,
    mealRemindersOn: true,
    pushSubscription: null,
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const isObject = (item: any) => (item && typeof item === 'object' && !Array.isArray(item));

const deepMerge = (target: any, source: any): any => {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem("app_state");
    if (!saved) return DEFAULT_STATE;
    try {
      const parsed = JSON.parse(saved);
      return deepMerge(DEFAULT_STATE, parsed);
    } catch (e) {
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    localStorage.setItem("app_state", JSON.stringify(state));
  }, [state]);

  const setUser = (user: Partial<User>) =>
    setState(prev => ({ ...prev, user: { ...prev.user, ...user } }));

  const setGoals = (goals: Partial<Goals>) =>
    setState(prev => ({ ...prev, goals: { ...prev.goals, ...goals } }));

  const addMeal = (meal: MealEntry) =>
    setState(prev => ({
      ...prev,
      today: {
        ...prev.today,
        meals: [meal, ...prev.today.meals],
        caloriesConsumed: prev.today.caloriesConsumed + (typeof meal.kcal === 'number' ? meal.kcal : 0)
      }
    }));

  const setWater = (ml: number, cups?: number) =>
    setState(prev => ({
      ...prev,
      today: {
        ...prev.today,
        waterMl: ml,
        cupsFilledCount: cups !== undefined ? cups : Math.min(8, Math.floor(ml / 250))
      }
    }));

  const setFastingStart = (isoDate: string) =>
    setState(prev => ({ ...prev, today: { ...prev.today, fastingStart: isoDate } }));

  const setShoppingList = (list: ShoppingItem[]) =>
    setState(prev => ({ ...prev, shoppingList: list }));

  const toggleShoppingItem = (id: string) =>
    setState(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }));

  const setBatchMeals = (mealIds: string[]) =>
    setState(prev => ({ ...prev, batchMeals: mealIds }));

  const addRecentScan = (scan: any) =>
    setState(prev => ({ ...prev, recentScans: [scan, ...prev.recentScans].slice(0, 10) }));

  const updateWeeklyWater = (day: string, ml: number) =>
    setState(prev => ({
      ...prev,
      weeklyWater: prev.weeklyWater.map(d => d.day === day ? { ...d, ml } : d)
    }));

  const setNotificationPrefs = (prefs: Partial<NotificationPrefs>) =>
    setState(prev => ({ ...prev, notifications: { ...prev.notifications, ...prefs } }));

  return (
    <AppContext.Provider value={{
      state,
      setUser,
      setGoals,
      addMeal,
      setWater,
      setFastingStart,
      setShoppingList,
      toggleShoppingItem,
      setBatchMeals,
      addRecentScan,
      updateWeeklyWater,
      setNotificationPrefs
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
