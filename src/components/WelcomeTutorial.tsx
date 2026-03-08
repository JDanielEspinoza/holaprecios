import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FileText, Users, User, Menu, Bot, BarChart3, Rocket } from "lucide-react";
import logoWispro from "@/assets/logo-wispro.png";
import logoAcs from "@/assets/logo-acs.png";

const TUTORIAL_KEY = "wispro_tutorial_seen";

interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
  tip?: string;
}

const slides: Slide[] = [
  {
    icon: <Rocket className="h-12 w-12 text-orange-500" />,
    title: "¡Bienvenido a Wispro + IXC Soft!",
    description: "Esta herramienta te permite cotizar productos, gestionar clientes y enviar propuestas profesionales en segundos.",
    tip: "Te guiaremos en un recorrido rápido por las funciones principales.",
  },
  {
    icon: <Menu className="h-12 w-12 text-indigo-500" />,
    title: "Menú de navegación",
    description: "Usá el ícono ☰ en la esquina superior izquierda para acceder a todas las secciones: cotizaciones, perfil, usuarios y más.",
    tip: "Dentro de 'Cotizar' encontrarás Andina Link 2026, Hola! Suite IA y Opa! Suite IA.",
  },
  {
    icon: <FileText className="h-12 w-12 text-orange-500" />,
    title: "Crear una cotización",
    description: "Seleccioná los productos (Wispro, ACS, Hola! Suite), elegí la cantidad de clientes y ajustá los addons. El sistema calcula descuentos automáticamente.",
    tip: "Cuantos más productos combines, mayor será el descuento por paquete.",
  },
  {
    icon: <Users className="h-12 w-12 text-indigo-500" />,
    title: "Datos del cliente",
    description: "Completá nombre, empresa, email y teléfono del cliente. Estos datos aparecerán en la cotización final y se guardarán para tu historial.",
  },
  {
    icon: <BarChart3 className="h-12 w-12 text-orange-500" />,
    title: "Mis Cotizaciones",
    description: "Accedé al historial completo de cotizaciones enviadas. Podés filtrar, buscar y ver el detalle de cada una.",
    tip: "También podés compartir cotizaciones por WhatsApp o copiar el enlace.",
  },
  {
    icon: <Bot className="h-12 w-12 text-indigo-500" />,
    title: "Cotizadores de IA",
    description: "Hola! Suite IA y Opa! Suite IA tienen calculadoras específicas para estimar costos de atendimientos IA y plantillas de WhatsApp por país.",
  },
  {
    icon: <User className="h-12 w-12 text-orange-500" />,
    title: "Tu Perfil",
    description: "Completá tu nombre, cargo, email y foto. Estos datos se mostrarán en el pie de cada cotización que envíes.",
    tip: "¡Ya estás listo! Cerrá este tutorial y comenzá a cotizar.",
  },
];

const WelcomeTutorial = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_KEY);
    if (!seen) setOpen(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem(TUTORIAL_KEY, "true");
    setOpen(false);
  };

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else handleClose();
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-0 shadow-2xl">
        {/* Progress bar */}
        <div className="flex gap-1 px-6 pt-5">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                background: i <= current
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted))",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pt-6 pb-2 text-center space-y-4">
          <div className="flex justify-center">{slide.icon}</div>
          <h3 className="text-xl font-bold" style={{ fontFamily: "'Exo', sans-serif" }}>
            {slide.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {slide.description}
          </p>
          {slide.tip && (
            <div className="bg-muted/50 rounded-lg px-4 py-2.5 text-xs text-muted-foreground">
              💡 {slide.tip}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5 pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={current === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>

          <span className="text-xs text-muted-foreground">
            {current + 1} / {slides.length}
          </span>

          <Button
            size="sm"
            onClick={next}
            className="gap-1 btn-premium"
          >
            {isLast ? "¡Empezar!" : "Siguiente"} {!isLast && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Skip */}
        {!isLast && (
          <div className="text-center pb-4">
            <button
              onClick={handleClose}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Omitir tutorial
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeTutorial;
