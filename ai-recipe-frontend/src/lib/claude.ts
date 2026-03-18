export async function askClaude(system: string, message: string): Promise<string> {
  const apiUrl = import.meta.env.VITE_API_URL || "https://ai-recipe-finder-gfdv.onrender.com";
  const res = await fetch(`${apiUrl}/api/v1/ai/claude`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system,
      message
    })
  });
  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  const data = await res.json();
  return data.text;
}
