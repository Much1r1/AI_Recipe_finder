import { motion } from "framer-motion";
import { User, Settings } from "lucide-react";
import { getPersona } from "../lib/persona";

type Props = {
  onEdit?: () => void;
};

export default function PersonaBanner({ onEdit }: Props) {
  const persona = getPersona();

  if (!persona) return null;

  // Map persona string to display name
  const personaNames: Record<string, string> = {
    busy_professional: "Busy Professionals",
    student: "Students",
    health_focused: "Health-Focused Individuals",
    family_cook: "Family Cooks",
  };

  const displayName = personaNames[persona] || "You";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-soft-sage/40 rounded-2xl p-4 flex items-center justify-between mb-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">
            Optimized for <strong>{displayName}</strong>
          </p>
        </div>
      </div>
      
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
          aria-label="Edit preferences"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
    </motion.div>
  );
}