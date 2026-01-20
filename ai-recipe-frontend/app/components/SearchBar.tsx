"use client";

import { useState } from "react";

export default function SearchBar({
  onSearch,
}: {
  onSearch: (query: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");

  async function handleClick() {
    if (!query.trim()) return;
    await onSearch(query); // 🔥 THIS is the fix
  }

  return (
    <div className="flex gap-2">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 flex-1"
        placeholder="Enter ingredients..."
      />
      <button
        onClick={handleClick}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Search
      </button>
    </div>
  );
}
