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
    <div className="absolute top-4 right-4 z-10">
      <img
        src={logo}
        alt={activeEvent.name}
        className="h-12 w-auto object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
      />
    </div>
  );
};

export default EventBadge;
