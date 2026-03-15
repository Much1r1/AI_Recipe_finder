import { Camera, ScanBarcode } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const ActionCards = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link to="/snap" className="block">
        <motion.button
          whileHover={{ y: -4 }}
          className="glass-card p-5 text-left space-y-3 group w-full h-full hover:bg-card/60 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold font-syne text-sm">AI Snap</h4>
            <p className="text-xs text-muted-foreground">Log food via camera</p>
          </div>
        </motion.button>
      </Link>

      <Link to="/scanner" className="block">
        <motion.button
          whileHover={{ y: -4 }}
          className="glass-card p-5 text-left space-y-3 group w-full h-full hover:bg-card/60 transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <ScanBarcode className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold font-syne text-sm">Scanner</h4>
            <p className="text-xs text-muted-foreground">Scan product labels</p>
          </div>
        </motion.button>
      </Link>
    </div>
  );
};

export default ActionCards;
