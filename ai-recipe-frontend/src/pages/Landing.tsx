import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      <main className="relative z-10 container px-6 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary mb-4">
            <span className="text-xs font-bold uppercase tracking-wider">AI Powered Nutrition</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-syne tracking-tight text-white leading-tight">
            Eat better, <br />
            <span className="text-primary">thrive harder.</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-lg mx-auto font-dm-sans">
            Your personal AI nutritionist and meal planner. Personalized recipes,
            smart tracking, and science-backed insights.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/onboarding" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(200,245,96,0.3)]">
              Get Started
            </Button>
          </Link>
          <Link to="/auth" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10">
              Login
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
