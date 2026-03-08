import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Menu, User, FileText, LogOut, History, Building2, Users, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Mi Perfil", path: "/perfil", icon: User },
  { title: "Cotizar", path: "/", icon: FileText },
  { title: "Mis Cotizaciones", path: "/mis-cotizaciones", icon: History },
  { title: "Cotizaciones Andina", path: "/cotizaciones-andina", icon: Building2 },
  { title: "Usuarios", path: "/usuarios", icon: Users },
  { title: "Opa! Suite IA", path: "/opa-suite-ia", icon: Bot },
];

const AppMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    setTimeout(() => navigate(path), 150);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    setTimeout(() => signOut(), 150);
  };

  return (
    <>
      {/* Trigger Button */}
      <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setIsOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-700">Menú</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col py-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                  isActive
                    ? "bg-orange-50 text-orange-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-5 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AppMenu;