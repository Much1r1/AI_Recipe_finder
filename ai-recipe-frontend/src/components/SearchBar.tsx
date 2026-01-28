"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      await onSearch(query);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <motion.div
      className="search-input-wrapper w-full max-w-2xl mx-auto bg-card rounded-2xl overflow-hidden shadow-sm"
      animate={{ scale: isFocused ? 1.01 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3 px-5 py-4">
        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What ingredients do you have?"
          disabled={isLoading}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-lg outline-none disabled:opacity-50"
        />
        <motion.button
          onClick={handleSearch}
          disabled={isLoading || !query.trim()}
          className="px-5 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.97 }}
        >
          {isLoading ? "Searching..." : "Search"}
        </motion.button>
      </div>
    </motion.div>
  );
}