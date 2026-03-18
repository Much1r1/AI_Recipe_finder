import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit2,
  TrendingUp,
  Utensils,
  Target,
  Award,
  ChevronRight,
  Watch,
  Activity,
  Bell,
  Moon,
  Lock,
  Download,
  Trash2,
  LogOut,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";
import AmbientBackground from "@/components/AmbientBackground";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { state, setGoals, setUser } = useApp();
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [tempGoals, setTempGoals] = useState(state.goals);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          name: user.email?.split('@')[0] || "User",
          joinDate: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        });
      }
    };
    fetchUser();
  }, []);

  // Derive badges earned from real data
  const mealCount = state.today.meals.length; // Simplified for MVP
  const ACHIEVEMENTS = [
    { id: "week-warrior", title: "Week Warrior", icon: "🔥", desc: "7+ day streak", requirement: 7, value: state.user.streak },
    { id: "hydration-hero", title: "Hydration Hero", icon: "💧", desc: "Water goal 5 days", requirement: 5, value: 0 },
    { id: "meal-prepper", title: "Meal Prepper", icon: "🍱", desc: "First batch cook", requirement: 1, value: state.batchMeals.length > 0 ? 1 : 0 },
    { id: "30-day-legend", title: "30 Day Legend", icon: "👑", desc: "30 day streak", requirement: 30, value: state.user.streak },
  ];

  const badgesEarned = ACHIEVEMENTS.filter(ach => ach.value >= ach.requirement).length;

  const handleSaveGoal = (key: keyof typeof state.goals) => {
    setGoals({ [key]: Number(tempGoals[key]) });
    setEditingGoal(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
      <AmbientBackground />

      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold font-syne">Profile</h1>
        </div>
        <Button variant="ghost" size="sm" className="text-primary font-bold">Edit</Button>
      </header>

      <main className="container max-w-lg mx-auto pt-24 px-6 space-y-8 relative z-10">
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-blue-500 shadow-xl shadow-primary/20">
              <img
                src={state.user.avatar}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border-2 border-background"
              />
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full border-2 border-background text-primary-foreground shadow-lg">
              <Edit2 size={12} />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-black font-syne">{state.user.name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Joined {state.user.joinDate}</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-black">{state.user.plan} Plan</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="rounded-full bg-card px-3 py-1 border-border flex gap-1.5 items-center">
              <TrendingUp size={12} className="text-orange-500" />
              <span className="text-[10px] font-bold">{state.user.streak} Day Streak</span>
            </Badge>
            <Badge variant="outline" className="rounded-full bg-card px-3 py-1 border-border flex gap-1.5 items-center">
              <Award size={12} className="text-primary" />
              <span className="text-[10px] font-bold">Rank: {state.user.streak > 30 ? "Gold" : state.user.streak > 7 ? "Silver" : "Bronze"}</span>
            </Badge>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-2">
          {[
            { label: "Streak", value: `${state.user.streak}d`, icon: <TrendingUp size={14} className="text-orange-500" /> },
            { label: "Meals", value: mealCount, icon: <Utensils size={14} className="text-blue-500" /> },
            { label: "Goals", value: "—", icon: <Target size={14} className="text-primary" /> },
            { label: "Badges", value: badgesEarned, icon: <Award size={14} className="text-purple-500" /> }
          ].map((stat, i) => (
            <div key={i} className="glass-card p-3 flex flex-col items-center gap-1">
              {stat.icon}
              <span className="text-sm font-black font-syne">{stat.value}</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="bg-card border border-border rounded-[32px] overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-syne text-lg">Nutrition Goals</h3>
              <Target size={18} className="text-primary" />
            </div>

            <div className="space-y-3">
              {[
                { label: "Calories", key: "calories", unit: "kcal", color: "text-primary" },
                { label: "Protein", key: "protein", unit: "g", color: "text-blue-400" },
                { label: "Carbs", key: "carbs", unit: "g", color: "text-yellow-400" },
                { label: "Fats", key: "fats", unit: "g", color: "text-rose-400" },
                { label: "Water", key: "water", unit: "ml", color: "text-sky-400" }
              ].map((goal) => (
                <div key={goal.key} className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border border-border/50 group">
                  <span className="text-sm font-bold text-muted-foreground">{goal.label}</span>
                  <div className="flex items-center gap-3">
                    {editingGoal === goal.key ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          autoFocus
                          value={tempGoals[goal.key as keyof typeof state.goals]}
                          onChange={(e) => setTempGoals({ ...tempGoals, [goal.key]: e.target.value })}
                          onBlur={() => handleSaveGoal(goal.key as keyof typeof state.goals)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal(goal.key as keyof typeof state.goals)}
                          className="w-16 bg-background border border-primary rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
                        />
                        <span className="text-[10px] font-black uppercase text-muted-foreground">{goal.unit}</span>
                      </div>
                    ) : (
                      <>
                        <span className={cn("text-sm font-black font-syne", goal.color)}>
                          {state.goals[goal.key as keyof typeof state.goals]}{goal.unit}
                        </span>
                        <button
                          onClick={() => {
                            setTempGoals(state.goals);
                            setEditingGoal(goal.key);
                          }}
                          className="p-1.5 hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit2 size={12} className="text-muted-foreground" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Achievements</h3>
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = ach.value >= ach.requirement;
              return (
                <div key={ach.id} className={cn(
                  "glass-card p-4 relative overflow-hidden group border transition-all",
                  unlocked ? "border-primary/50" : "border-border/30 opacity-60"
                )}>
                  {!unlocked && <Lock className="absolute top-2 right-2 text-muted-foreground/30" size={14} />}
                  <div className="text-2xl mb-2">{ach.icon}</div>
                  <h4 className="text-xs font-bold font-syne mb-1">{ach.title}</h4>
                  <p className="text-[10px] text-muted-foreground mb-3">{ach.desc}</p>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (ach.value / ach.requirement) * 100)}%` }}
                      className={cn("h-full", unlocked ? "bg-primary" : "bg-muted-foreground/30")}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground">Progress</span>
                    <span className="text-[8px] font-black text-foreground">{ach.value} / {ach.requirement}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 rounded-[32px] p-6 relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <Badge className="bg-primary text-primary-foreground font-black text-[10px] uppercase mb-2">Active Plan</Badge>
              <h3 className="text-2xl font-black font-syne">{state.user.plan} Plan</h3>
              <p className="text-xs text-muted-foreground mt-1">Free Tier</p>
            </div>
            <p className="text-xl font-black font-syne">$0.00<span className="text-[10px] text-muted-foreground">/mo</span></p>
          </div>
          <Button className="w-full mt-6 rounded-2xl bg-foreground text-background font-black uppercase text-xs h-12 shadow-lg shadow-foreground/10 hover:bg-foreground/90 transition-all">
            Manage Subscription
          </Button>
        </section>

        <section className="bg-card border border-border rounded-[32px] overflow-hidden p-2">
          {[
            { label: "Edit Profile", icon: <Edit2 size={16} />, color: "text-primary" },
            { label: "Notifications", icon: <Bell size={16} />, color: "text-blue-400" },
            { label: "Dark Mode", icon: <Moon size={16} />, color: "text-purple-400", toggle: true },
            { label: "Privacy & Security", icon: <Shield size={16} />, color: "text-green-400" },
            { label: "Export My Data", icon: <Download size={16} />, color: "text-orange-400" },
            { label: "Delete Account", icon: <Trash2 size={16} />, color: "text-rose-500" }
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-muted/50 rounded-2xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                  {item.icon}
                </div>
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground/30" />
            </button>
          ))}
        </section>

        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full h-14 rounded-[24px] border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-black font-syne uppercase text-sm mb-12"
        >
          <LogOut size={18} className="mr-2" />
          Sign Out
        </Button>
      </main>
    </div>
  );
};

export default ProfilePage;
