import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
    name: "User",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
    streak: 0,
    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    plan: "Free"
  },
  goals: {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fats: 70,
    water: 2000
  },
  today: {
    caloriesConsumed: 0,
    waterMl: 0,
    meals: [],
    fastingStart: new Date().toISOString(),
    cupsFilledCount: 0
  },
  shoppingList: [],
  batchMeals: [],
  recentScans: [],
  weeklyWater: [
    { day: "Mon", ml: 0 },
    { day: "Tue", ml: 0 },
    { day: "Wed", ml: 0 },
    { day: "Thu", ml: 0 },
    { day: "Fri", ml: 0 },
    { day: "Sat", ml: 0 },
    { day: "Sun", ml: 0 },
  ],
  notifications: {
    permissionGranted: false,
    waterRemindersOn: false,
    waterIntervalMinutes: 60,
    mealRemindersOn: false,
    pushSubscription: null,
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [session, setSession] = useState<any>(null);

  const loadUserData = async (userId: string) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      // Fetch all data in parallel
      const [
        { data: profile },
        { data: goals },
        { data: meals },
        { data: waterLogs },
        { data: fasting },
        { data: shopping },
        { data: batch },
        { data: scans },
        { data: notify }
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("goals").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("meals").select("*").eq("user_id", userId).eq("date", todayStr),
        supabase.from("water_logs").select("*").eq("user_id", userId).gte("date", sevenDaysAgoStr),
        supabase.from("fasting_sessions").select("*").eq("user_id", userId).order("start_time", { ascending: false }).limit(1),
        supabase.from("shopping_list").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("batch_meals").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("scan_history").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
        supabase.from("notification_prefs").select("*").eq("user_id", userId).maybeSingle()
      ]);

      const newState = { ...DEFAULT_STATE };

      if (profile) {
        newState.user = {
          ...newState.user,
          name: profile.full_name || newState.user.name,
          avatar: profile.avatar_url || newState.user.avatar,
          streak: profile.streak || 0,
          joinDate: new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };
      }

      if (goals) {
        newState.goals = {
          calories: goals.calories || DEFAULT_STATE.goals.calories,
          protein: goals.protein || DEFAULT_STATE.goals.protein,
          carbs: goals.carbs || DEFAULT_STATE.goals.carbs,
          fats: goals.fats || DEFAULT_STATE.goals.fats,
          water: goals.water || DEFAULT_STATE.goals.water,
        };
      }

      if (meals) {
        newState.today.meals = meals.map(m => ({
          id: m.id,
          name: m.name,
          kcal: m.kcal,
          protein: m.protein,
          carbs: m.carbs,
          fats: m.fats,
          emoji: m.emoji,
          time: m.time
        }));
        newState.today.caloriesConsumed = newState.today.meals.reduce((sum, m) => sum + (Number(m.kcal) || 0), 0);
      }

      if (waterLogs) {
        const todayLog = waterLogs.find(l => l.date === todayStr);
        if (todayLog) {
          newState.today.waterMl = todayLog.ml;
          newState.today.cupsFilledCount = Math.min(8, Math.floor(todayLog.ml / 250));
        }

        const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        newState.weeklyWater = daysOrder.map(dayName => {
            const log = waterLogs.find(l => {
                const date = new Date(l.date + 'T00:00:00');
                return date.toLocaleDateString('en-US', { weekday: 'short' }) === dayName;
            });
            return { day: dayName, ml: log ? log.ml : 0 };
        });
      }

      if (fasting && fasting.length > 0) {
        newState.today.fastingStart = fasting[0].start_time;
      }

      if (shopping) {
        newState.shoppingList = shopping.items || [];
      }

      if (batch) {
        newState.batchMeals = batch.meal_ids || [];
      }

      if (scans) {
        newState.recentScans = scans.map(s => s.scan_data);
      }

      if (notify) {
        newState.notifications = {
          ...DEFAULT_STATE.notifications,
          permissionGranted: notify.permission_granted ?? DEFAULT_STATE.notifications.permissionGranted,
          waterRemindersOn: notify.water_reminders_on ?? DEFAULT_STATE.notifications.waterRemindersOn,
          waterIntervalMinutes: notify.water_interval_minutes ?? DEFAULT_STATE.notifications.waterIntervalMinutes,
          mealRemindersOn: notify.meal_reminders_on ?? DEFAULT_STATE.notifications.mealRemindersOn,
          pushSubscription: notify.push_subscription ?? DEFAULT_STATE.notifications.pushSubscription,
        };
      }

      setState(newState);
    } catch (e) {
      console.error("Error loading user data:", e);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadUserData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) loadUserData(session.user.id);
      else setState(DEFAULT_STATE);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setUser = async (userData: Partial<User>) => {
    setState(prev => {
        const nextUser = { ...prev.user, ...userData };
        const nextState = { ...prev, user: nextUser };
        if (session?.user) {
            supabase.from("profiles").upsert({
                id: session.user.id,
                full_name: nextUser.name,
                avatar_url: nextUser.avatar,
                updated_at: new Date().toISOString()
            }).then(({ error }) => { if (error) console.error("Error updating profile:", error); });
        }
        return nextState;
    });
  };

  const setGoals = async (goalData: Partial<Goals>) => {
    setState(prev => {
        const nextGoals = { ...prev.goals, ...goalData };
        const nextState = { ...prev, goals: nextGoals };
        if (session?.user) {
            supabase.from("goals").upsert({
                user_id: session.user.id,
                calories: nextGoals.calories,
                protein: nextGoals.protein,
                carbs: nextGoals.carbs,
                fats: nextGoals.fats,
                water: nextGoals.water,
                updated_at: new Date().toISOString()
            }).then(({ error }) => { if (error) console.error("Error updating goals:", error); });
        }
        return nextState;
    });
  };

  const addMeal = async (meal: MealEntry) => {
    setState(prev => {
        const nextMeals = [meal, ...prev.today.meals];
        const nextState = {
            ...prev,
            today: {
                ...prev.today,
                meals: nextMeals,
                caloriesConsumed: prev.today.caloriesConsumed + (typeof meal.kcal === 'number' ? meal.kcal : 0)
            }
        };
        if (session?.user) {
            supabase.from("meals").insert({
                user_id: session.user.id,
                date: new Date().toISOString().split('T')[0],
                name: meal.name,
                kcal: meal.kcal,
                protein: meal.protein,
                carbs: meal.carbs,
                fats: meal.fats,
                emoji: meal.emoji,
                time: meal.time
            }).then(({ error }) => { if (error) console.error("Error adding meal:", error); });
        }
        return nextState;
    });
  };

  const setWater = async (ml: number, cups?: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setState(prev => {
        const nextState = {
            ...prev,
            today: {
                ...prev.today,
                waterMl: ml,
                cupsFilledCount: cups !== undefined ? cups : Math.min(8, Math.floor(ml / 250))
            }
        };
        if (session?.user) {
            supabase.from("water_logs").upsert({
                user_id: session.user.id,
                date: todayStr,
                ml: ml,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,date' }).then(({ error }) => { if (error) console.error("Error updating water log:", error); });
        }
        return nextState;
    });
  };

  const setFastingStart = async (isoDate: string) => {
    setState(prev => {
        const nextState = { ...prev, today: { ...prev.today, fastingStart: isoDate } };
        if (session?.user) {
            supabase.from("fasting_sessions").upsert({
                user_id: session.user.id,
                start_time: isoDate,
                updated_at: new Date().toISOString()
            }).then(({ error }) => { if (error) console.error("Error updating fasting session:", error); });
        }
        return nextState;
    });
  };

  const setShoppingList = async (list: ShoppingItem[]) => {
    setState(prev => {
        const nextState = { ...prev, shoppingList: list };
        if (session?.user) {
            supabase.from("shopping_list").upsert({
                user_id: session.user.id,
                items: list,
                updated_at: new Date().toISOString()
            }).then(({ error }) => { if (error) console.error("Error updating shopping list:", error); });
        }
        return nextState;
    });
  };

  const toggleShoppingItem = async (id: string) => {
    setState(prev => {
        const newList = prev.shoppingList.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        );
        const nextState = { ...prev, shoppingList: newList };
        if (session?.user) {
            supabase.from("shopping_list").upsert({
                user_id: session.user.id,
                items: newList,
                updated_at: new Date().toISOString()
            }).then(({ error }) => { if (error) console.error("Error updating shopping list:", error); });
        }
        return nextState;
    });
  };

  const setBatchMeals = async (mealIds: string[]) => {
    setState(prev => {
        const nextState = { ...prev, batchMeals: mealIds };
        if (session?.user) {
            supabase.from("batch_meals").upsert({
                user_id: session.user.id,
                meal_ids: mealIds,
                updated_at: new Date().toISOString()
            }).then(({ error }) => { if (error) console.error("Error updating batch meals:", error); });
        }
        return nextState;
    });
  };

  const addRecentScan = async (scan: any) => {
    setState(prev => {
        const nextScans = [scan, ...prev.recentScans].slice(0, 10);
        const nextState = { ...prev, recentScans: nextScans };
        if (session?.user) {
            supabase.from("scan_history").insert({
                user_id: session.user.id,
                scan_data: scan,
                created_at: new Date().toISOString()
            }).then(({ error }) => { if (error) console.error("Error adding scan history:", error); });
        }
        return nextState;
    });
  };

  const updateWeeklyWater = (day: string, ml: number) =>
    setState(prev => ({
      ...prev,
      weeklyWater: prev.weeklyWater.map(d => d.day === day ? { ...d, ml } : d)
    }));

  const setNotificationPrefs = async (prefs: Partial<NotificationPrefs>) => {
    setState(prev => {
        const newPrefs = { ...prev.notifications, ...prefs };
        const nextState = { ...prev, notifications: newPrefs };
        if (session?.user) {
            supabase.from("notification_prefs").upsert({
                user_id: session.user.id,
                permission_granted: newPrefs.permissionGranted,
                water_reminders_on: newPrefs.waterRemindersOn,
                water_interval_minutes: newPrefs.waterIntervalMinutes,
                meal_reminders_on: newPrefs.mealRemindersOn,
                push_subscription: newPrefs.pushSubscription,
                updated_at: new Date().toISOString()
            }).then(({ error }) => { if (error) console.error("Error updating notification prefs:", error); });
        }
        return nextState;
    });
  };

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
