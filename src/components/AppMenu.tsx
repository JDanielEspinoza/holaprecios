import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Menu, User, Globe, FileText, LogOut, History, Building2, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const AppMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem
          onClick={() => navigate("/perfil")}
          className={location.pathname === "/perfil" ? "bg-accent" : ""}
        >
          <User className="mr-2 h-4 w-4" />
          Mi Perfil
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/landing")}
          className={location.pathname === "/landing" ? "bg-accent" : ""}
        >
          <Globe className="mr-2 h-4 w-4" />
          Landing Page
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/")}
          className={location.pathname === "/" ? "bg-accent" : ""}
        >
          <FileText className="mr-2 h-4 w-4" />
          Cotizar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/mis-cotizaciones")}
          className={location.pathname === "/mis-cotizaciones" ? "bg-accent" : ""}
        >
          <History className="mr-2 h-4 w-4" />
          Mis Cotizaciones
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/cotizaciones-andina")}
          className={location.pathname === "/cotizaciones-andina" ? "bg-accent" : ""}
        >
          <Building2 className="mr-2 h-4 w-4" />
          Cotizaciones Andina
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/usuarios")}
          className={location.pathname === "/usuarios" ? "bg-accent" : ""}
        >
          <Users className="mr-2 h-4 w-4" />
          Usuarios
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AppMenu;
