export type Persona = "busy_professional";

const PERSONA_KEY = "user_persona";

export function getPersona(): Persona | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PERSONA_KEY) as Persona | null;
}

export function setPersona(persona: Persona) {
  localStorage.setItem(PERSONA_KEY, persona);
}
