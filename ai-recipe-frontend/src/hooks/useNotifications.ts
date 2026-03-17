import { useApp } from "@/context/AppContext";

let activeTimeouts: number[] = [];

export function useNotifications() {
  const { state, setNotificationPrefs } = useApp();

  const clearAllScheduled = () => {
    activeTimeouts.forEach(id => clearTimeout(id));
    activeTimeouts = [];
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return null;
    }

    const permission = await Notification.requestPermission();
    setNotificationPrefs({ permissionGranted: permission === 'granted' });

    if (permission !== 'granted') return null;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_PUBLIC_VAPID_PUBLIC_KEY
      });
      setNotificationPrefs({ pushSubscription: sub });
      return sub;
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
      return null;
    }
  };

  const scheduleLocal = (title: string, body: string, delayMs: number, tag: string, url = '/') => {
    const id = window.setTimeout(() => {
      if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            tag,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            data: { url }
          });
        });
      }
      activeTimeouts = activeTimeouts.filter(t => t !== id);
    }, delayMs);
    activeTimeouts.push(id);
  };

  const scheduleWaterReminders = (intervalMinutes: number) => {
    const messages = [
      "💧 Time to hydrate! Grab a glass of water.",
      "💧 You're behind on water. Drink up!",
      "💧 Halfway to your goal — keep sipping!",
      "💧 Don't forget your water. Your body needs it!",
    ];

    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(22, 0, 0, 0);

    let count = 0;
    let next = new Date(now.getTime() + intervalMinutes * 60 * 1000);

    while (next < endOfDay && count < 8) {
      if (next.getHours() >= 8) {
        const delay = next.getTime() - now.getTime();
        const msg = messages[count % messages.length];
        scheduleLocal('QuickBite · Hydration', msg, delay, `water-${count}`, '/hydration');
      }
      next = new Date(next.getTime() + intervalMinutes * 60 * 1000);
      count++;
    }
  };

  const hasLoggedMealInWindow = (label: string) => {
    const meals = state.today.meals;
    return meals.some(meal => {
      // Very simple check: does the meal name or time suggest it's the right slot?
      const time = meal.time.toLowerCase();
      if (label === 'Breakfast') return time.includes('am') && parseInt(time) < 11;
      if (label === 'Lunch') return (time.includes('pm') && parseInt(time) < 4) || (time.includes('12') && time.includes('pm'));
      if (label === 'Dinner') return time.includes('pm') && parseInt(time) >= 4;
      return false;
    });
  };

  const scheduleMealReminders = () => {
    const now = new Date();
    const slots = [
      { label: 'Breakfast', hour: 8, minute: 0, msg: "🍳 Don't forget to log your breakfast!" },
      { label: 'Lunch',     hour: 13, minute: 0, msg: "🥗 Log your lunch to stay on track." },
      { label: 'Dinner',    hour: 19, minute: 0, msg: "🍽️ Evening check-in — log your dinner!" },
    ];

    slots.forEach(({ label, hour, minute, msg }) => {
      if (hasLoggedMealInWindow(label)) return;

      const target = new Date();
      target.setHours(hour, minute, 0, 0);

      if (target <= now) return; // skip if already passed today

      const delay = target.getTime() - now.getTime();
      scheduleLocal('QuickBite · Meal Reminder', msg, delay, `meal-${label}`, '/');
    });
  };

  return { requestPermission, scheduleLocal, scheduleWaterReminders, scheduleMealReminders, clearAllScheduled };
}
