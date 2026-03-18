'use client';

import { Persona } from '@/hooks/usePersona';

interface PersonaSelectorProps {
  persona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

const PERSONA_LABELS: Record<Persona, { label: string; description: string }> = {
  SDR: { label: 'SDR', description: 'Sales Development Rep' },
  AE: { label: 'AE', description: 'Account Executive' },
  SE: { label: 'SE', description: 'Solutions Engineer' },
  VE: { label: 'VE', description: 'Value Engineer' },
};

export default function PersonaSelector({ persona, onPersonaChange }: PersonaSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="persona-select" className="text-xs text-gray-500 hidden sm:inline">
        Role:
      </label>
      <select
        id="persona-select"
        value={persona}
        onChange={(e) => onPersonaChange(e.target.value as Persona)}
        className="text-xs sm:text-sm bg-gray-100 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
        title={PERSONA_LABELS[persona].description}
      >
        {(Object.keys(PERSONA_LABELS) as Persona[]).map((p) => (
          <option key={p} value={p}>
            {PERSONA_LABELS[p].label}
          </option>
        ))}
      </select>
    </div>
  );
}
