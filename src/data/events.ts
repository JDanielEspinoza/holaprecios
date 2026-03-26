export interface EventConfig {
  code: string;
  name: string;
  language: "es" | "pt-br";
  prefix: string | null;
  active: boolean;
  webhookUrl?: string; // Override webhook URL per event (future)
}

export const EVENTS: Record<string, EventConfig> = {
  NONE: {
    code: "NONE",
    name: "Sin evento",
    language: "es",
    prefix: null,
    active: true,
  },
  ANDINA26: {
    code: "ANDINA26",
    name: "Andina Link 2026",
    language: "es",
    prefix: "ANDINA",
    active: false,
  },
  APTC26: {
    code: "APTC26",
    name: "APTC Cumbre 2026",
    language: "es",
    prefix: "APTC26",
    active: true,
  },
  ABRINT26: {
    code: "ABRINT26",
    name: "Abrint 2026",
    language: "pt-br",
    prefix: "ABRINT26",
    active: true,
  },
};

export const EVENT_LIST = Object.values(EVENTS);
export const ACTIVE_EVENTS = EVENT_LIST.filter((e) => e.active);

export function getEventByCode(code: string | null): EventConfig {
  if (!code || code === "NONE") return EVENTS.NONE;
  return EVENTS[code] || EVENTS.NONE;
}
