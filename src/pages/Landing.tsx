import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import AppMenu from "@/components/AppMenu";
import EventBadge from "@/components/EventBadge";
import { Button } from "@/components/ui/button";
import logoWispro from "@/assets/logo-wispro.png";
import logoHola from "@/assets/logo-hola.png";
import logoOpa from "@/assets/logo-opa-suite.png";
import logoAssina from "@/assets/ixc-assina-logo.png";
import logoIxc from "@/assets/logo-ixcsoft.png";
import { FileText, Clock, ChevronRight } from "lucide-react";

const PRODUCTS = [
  {
    name: "Ecosistema Wispro + IXC",
    description: "Wispro, ACS y Hola! Suite",
    logo: logoWispro,
    route: "/hola-suite",
    color: "border-orange-500/30 hover:border-orange-500",
    iconBg: "bg-orange-500/10",
  },
  {
    name: "Opa! Suite",
    description: "Plataforma de atendimento IXC",
    logo: logoOpa,
    route: "/opa-suite",
    color: "border-blue-500/30 hover:border-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    name: "IXC Assina",
    description: "Assinatura digital de documentos",
    logo: logoAssina,
    route: "/ixc-assina",
    color: "border-teal-500/30 hover:border-teal-500",
    iconBg: "bg-teal-500/10",
  },
  {
    name: "Família Inmap",
    description: "Gestão de redes IXC",
    logo: logoIxc,
    route: "/familia-inmap",
    color: "border-indigo-500/30 hover:border-indigo-500",
    iconBg: "bg-indigo-500/10",
  },
  {
    name: "IXC Consult",
    description: "Consultoría especializada",
    logo: logoIxc,
    route: "/coming-soon-ixc",
    color: "border-gray-300 hover:border-gray-400",
    iconBg: "bg-gray-100",
    comingSoon: true,
  },
  {
    name: "Olli",
    description: "Solución inteligente IXC",
    logo: logoIxc,
    route: "/coming-soon-olli",
    color: "border-gray-300 hover:border-gray-400",
    iconBg: "bg-gray-100",
    comingSoon: true,
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();

  const firstName = profile?.nombre?.split(" ")[0] || "vendedor";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>
      <EventBadge />

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-10">

        {/* Hero */}
        <div className="text-center space-y-3 pt-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Bienvenido, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            ¿Qué solución vas a cotizar hoy?
          </p>
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map((product) => (
            <button
              key={product.name}
              onClick={() => navigate(product.route)}
              className={`relative flex flex-col items-center text-center p-6 rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${product.color} ${product.comingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              disabled={product.comingSoon}
            >
              {product.comingSoon && (
                <span className="absolute top-3 right-3 text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                  Pronto
                </span>
              )}
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 ${product.iconBg}`}>
                <img
                  src={product.logo}
                  alt={product.name}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                {product.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {product.description}
              </p>
              {!product.comingSoon && (
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
                  Cotizar <ChevronRight className="h-3 w-3" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Quick access to recent quotes */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 h-12 text-gray-600 border-gray-200 hover:bg-gray-100"
            onClick={() => navigate("/mis-cotizaciones")}
          >
            <FileText className="h-4 w-4" />
            Mis cotizaciones
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2 h-12 text-gray-600 border-gray-200 hover:bg-gray-100"
            onClick={() => navigate("/cotizaciones")}
          >
            <Clock className="h-4 w-4" />
            Historial del equipo
          </Button>
        </div>

      </main>
    </div>
  );
};

export default Landing;
