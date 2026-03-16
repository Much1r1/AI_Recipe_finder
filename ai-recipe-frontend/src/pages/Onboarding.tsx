import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import AmbientBackground from "@/components/AmbientBackground";

const STEPS = [
  {
    id: "goal",
    question: "What are you trying to achieve?",
    options: [
      "Hit macro goals",
      "Meal prep for the week",
      "Find simple recipes",
      "Last minute dinner inspiration",
      "Feed my family",
      "Live well for longer",
    ],
  },
  {
    id: "barriers",
    question: "What prevents you from doing that?",
    options: [
      "Lack of time",
      "Too tired after work",
      "Find cooking difficult",
      "Limited budget",
      "Picky eaters",
      "Lack of inspiration",
    ],
  },
  {
    id: "wants",
    question: "What would you like?",
    options: [
      "Packed lunches",
      "High protein",
      "Veggie recipes",
      "Healthy breakfast",
      "Low carb",
      "Quick snacks",
    ],
  },
  {
    id: "diet",
    question: "Any dietary requirements?",
    options: ["None", "Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Keto"],
  },
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();

  const handleToggleOption = (stepId: string, option: string) => {
    setSelections((prev) => {
      const current = prev[stepId] || [];
      if (current.includes(option)) {
        return { ...prev, [stepId]: current.filter((o) => o !== option) };
      }
      return { ...prev, [stepId]: [...current, option] };
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("onboarding_selections", JSON.stringify(selections));
      navigate("/auth");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/");
    }
  };

  const currentStepData = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 relative overflow-hidden">
      <AmbientBackground />

      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col pt-12">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mb-12 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <span className="text-primary font-bold text-sm uppercase tracking-widest">
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <h2 className="text-4xl font-bold font-syne text-white leading-tight">
                {currentStepData.question}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentStepData.options.map((option) => {
                const isSelected = (selections[currentStepData.id] || []).includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleToggleOption(currentStepData.id, option)}
                    className={`p-5 rounded-2xl text-left transition-all duration-300 border flex items-center justify-between group ${
                      isSelected
                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(200,245,96,0.2)]"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="font-bold">{option}</span>
                    {isSelected ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/20 group-hover:border-white/40" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-12 flex gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="h-14 px-6 rounded-2xl text-white/50 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg"
          >
            {currentStep === STEPS.length - 1 ? "Complete" : "Next"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
