import { getPersona } from "../lib/persona";

export default function PersonaBanner() {
  const persona = getPersona();

  if (!persona) return null;

  return (
    <div className="mb-4 text-sm text-green-800 bg-green-100 px-3 py-2 rounded">
      ⚡ Optimized for <strong>Busy Professionals</strong>
    </div>
  );
}
