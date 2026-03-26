import { useEvent } from "@/contexts/EventContext";
import eventAndina from "@/assets/event-andina.png";
import eventAbrint from "@/assets/event-abrint.png";
import eventAptc from "@/assets/event-aptc.png";

const EVENT_LOGOS: Record<string, string> = {
  ANDINA26: eventAndina,
  ABRINT26: eventAbrint,
  APTC26: eventAptc,
};

const EventBadge = () => {
  const { activeEvent } = useEvent();

  if (activeEvent.code === "NONE") return null;

  const logo = EVENT_LOGOS[activeEvent.code];
  if (!logo) return null;

  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
        {activeEvent.language === "pt-br" ? "Evento" : "Evento"}
      </span>
      <img
        src={logo}
        alt={activeEvent.name}
        className="h-7 w-auto object-contain"
      />
    </div>
  );
};

export default EventBadge;
