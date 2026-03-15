import { Users } from "lucide-react";
import { Link } from "react-router-dom";

const CommunityCard = () => {
  return (
    <Link to="/community" className="block">
      <div className="flex items-center justify-center p-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full text-secondary hover:bg-secondary/20 transition-colors">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          <Users className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            1,248 members active
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CommunityCard;
