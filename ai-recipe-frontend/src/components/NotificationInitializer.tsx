import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationInitializer = () => {
  const { state } = useApp();
  const { scheduleWaterReminders, scheduleMealReminders, clearAllScheduled } = useNotifications();

  useEffect(() => {
    clearAllScheduled();
    if (Notification.permission === 'granted') {
      if (state.notifications.waterRemindersOn) {
        scheduleWaterReminders(state.notifications.waterIntervalMinutes);
      }
      if (state.notifications.mealRemindersOn) {
        scheduleMealReminders();
      }
    }
    return () => clearAllScheduled();
  }, [
    state?.notifications?.permissionGranted ?? false,
    state.notifications.waterRemindersOn,
    state.notifications.waterIntervalMinutes,
    state.notifications.mealRemindersOn,
    state.today.meals.length
  ]);

  return null;
};
