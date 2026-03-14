import { motion } from "framer-motion";

interface ChipToggleProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function ChipToggle({ label, isActive, onClick }: ChipToggleProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`chip-toggle ${isActive ? "chip-toggle-active" : "chip-toggle-inactive"}`}
      whileTap={{ scale: 0.95 }}
      layout
    >
      {label}
    </motion.button>
  );
}
