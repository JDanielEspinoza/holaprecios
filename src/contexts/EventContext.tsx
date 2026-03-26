import React, { createContext, useContext, useState, useEffect } from "react";
import { EventConfig, EVENTS, getEventByCode } from "@/data/events";

interface EventContextType {
  activeEvent: EventConfig;
  setActiveEventCode: (code: string) => void;
  eventCode: string | null; // NULL for "Sin evento", otherwise the code
}

const EventContext = createContext<EventContextType>({
  activeEvent: EVENTS.NONE,
  setActiveEventCode: () => {},
  eventCode: null,
});

const STORAGE_KEY = "hola-active-event";

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [code, setCode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "NONE";
    } catch {
      return "NONE";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
  }, [code]);

  const activeEvent = getEventByCode(code);
  const eventCode = code === "NONE" ? null : code;

  return (
    <EventContext.Provider value={{ activeEvent, setActiveEventCode: setCode, eventCode }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);
