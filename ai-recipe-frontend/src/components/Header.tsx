import { Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl font-syne">Q</span>
          </div>
          <span className="text-xl font-bold font-syne tracking-tight">QuickBite</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-9 h-9" />
          <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xl font-syne">Q</span>
        </div>
        <span className="text-xl font-bold font-syne tracking-tight">QuickBite</span>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <Avatar className="w-10 h-10 border border-border">
          <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop" />
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;
