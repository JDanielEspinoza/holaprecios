import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/contexts/EventContext";
import { EVENTS, ACTIVE_EVENTS } from "@/data/events";
import { Menu, User, FileText, LogOut, History, Building2, Users, X, Bot, ChevronDown, Calendar, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import eventAndina from "@/assets/event-andina.png";
import eventAbrint from "@/assets/event-abrint.png";
import eventAptc from "@/assets/event-aptc.png";

const EVENT_LOGOS: Record<string, string> = {
  ANDINA26: eventAndina,
  ABRINT26: eventAbrint,
  APTC26: eventAptc,
};

type MenuItem = {
  title: string;
  titlePt?: string;
  path?: string;
  icon: React.ElementType;
  children?: { title: string; titlePt?: string; path: string; icon: React.ElementType; comingSoon?: boolean }[];
};

const menuItems: MenuItem[] = [
  { title: "Mi Perfil", titlePt: "Meu Perfil", path: "/perfil", icon: User },
  {
    title: "Cotizar",
    titlePt: "Cotar",
    icon: FileText,
    children: [
      { title: "Ecosistema Wispro + IXC", titlePt: "Ecossistema Wispro + IXC", path: "/", icon: Cpu },
      { title: "Hola! Suite IA", path: "/hola-suite-ia", icon: Bot },
      { title: "Opa! Suite IA", path: "/opa-suite-ia", icon: Bot },
      { title: "Opa! Suite", path: "/opa-suite", icon: Bot },
      { title: "IXC Consult", path: "/coming-soon-ixc", icon: Bot, comingSoon: true },
      { title: "Olli", path: "/coming-soon-olli", icon: Bot, comingSoon: true },
    ],
  },
  { title: "Mis Cotizaciones", titlePt: "Minhas Cotações", path: "/mis-cotizaciones", icon: History },
  { title: "Cotizaciones", titlePt: "Cotações", path: "/cotizaciones", icon: Building2 },
  { title: "Usuarios", titlePt: "Usuários", path: "/usuarios", icon: Users },
];

const AppMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { activeEvent, setActiveEventCode } = useEvent();

  const isPt = activeEvent.language === "pt-br";
  const t = (item: { title: string; titlePt?: string }) =>
    isPt && item.titlePt ? item.titlePt : item.title;

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    setExpandedMenu(null);
    setTimeout(() => navigate(path), 150);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    setTimeout(() => signOut(), 150);
  };

  const toggleSubmenu = (title: string) => {
    setExpandedMenu((prev) => (prev === title ? null : title));
  };

  const isChildActive = (item: MenuItem) =>
    item.children?.some((c) => location.pathname === c.path) ?? false;

  const eventLogo = EVENT_LOGOS[activeEvent.code];

  return (
    <>
      <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:text-white/80" onClick={() => setIsOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-700">{isPt ? "Menu" : "Menú"}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Event selector */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {isPt ? "Evento ativo" : "Evento activo"}
            </span>
            {eventLogo && (
              <img src={eventLogo} alt={activeEvent.name} className="h-5 w-auto object-contain ml-auto" />
            )}
          </div>
          <Select
            value={activeEvent.code}
            onValueChange={(v) => setActiveEventCode(v)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">{isPt ? "Sem evento" : EVENTS.NONE.name}</SelectItem>
              {ACTIVE_EVENTS.filter((e) => e.code !== "NONE").map((event) => (
                <SelectItem key={event.code} value={event.code}>
                  <div className="flex items-center gap-2">
                    {EVENT_LOGOS[event.code] && (
                      <img src={EVENT_LOGOS[event.code]} alt="" className="h-4 w-auto object-contain" />
                    )}
                    <span>{event.name}</span>
                  </div>
                </SelectItem>
              ))}
              {Object.values(EVENTS)
                .filter((e) => !e.active && e.code !== "NONE")
                .map((event) => (
                  <SelectItem key={event.code} value={event.code} disabled>
                    {event.name} ({isPt ? "finalizado" : "finalizado"})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <nav className="flex flex-col py-2">
          {menuItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedMenu === item.title;
              const childActive = isChildActive(item);
              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={`flex items-center justify-between w-full px-5 py-3.5 text-left transition-colors ${
                      childActive
                        ? "bg-orange-50 text-orange-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{t(item)}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      isExpanded ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    {item.children.map((child) => {
                      const isActive = location.pathname === child.path;
                      return (
                        <button
                          key={child.title}
                          onClick={() => handleNavigate(child.path)}
                          className={`flex items-center gap-3 pl-12 pr-5 py-3 text-left w-full transition-colors text-sm ${
                            isActive
                              ? "bg-orange-50 text-orange-600 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <child.icon className="h-4 w-4" />
                          <span>{t(child)}</span>
                          {child.comingSoon && (
                            <span className="ml-auto text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                              {isPt ? "Em breve" : "Pronto"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path!)}
                className={`flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{t(item)}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-5 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>{isPt ? "Sair" : "Cerrar Sesión"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AppMenu;
