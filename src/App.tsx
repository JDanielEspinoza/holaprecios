import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { EventProvider } from "@/contexts/EventContext";
import Index from "./pages/Index";
import Cotizacion from "./pages/Cotizacion";
import MisCotizaciones from "./pages/MisCotizaciones";
import CotizacionesAndina from "./pages/CotizacionesAndina";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Perfil from "./pages/Perfil";
import Usuarios from "./pages/Usuarios";
import OpaSuiteIA from "./pages/OpaSuiteIA";
import HolaSuiteIA from "./pages/HolaSuiteIA";
import OpaSuite from "./pages/OpaSuite";
import IxcAssina from "./pages/IxcAssina";
import Landing from "./pages/Landing";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <EventProvider>
            <Routes>
              <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/cotizacion" element={<Cotizacion />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
              <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
              <Route path="/mis-cotizaciones" element={<ProtectedRoute><MisCotizaciones /></ProtectedRoute>} />
              <Route path="/cotizaciones-andina" element={<Navigate to="/cotizaciones" replace />} />
              <Route path="/cotizaciones" element={<ProtectedRoute><CotizacionesAndina /></ProtectedRoute>} />
              <Route path="/opa-suite-ia" element={<ProtectedRoute><OpaSuiteIA /></ProtectedRoute>} />
              <Route path="/hola-suite-ia" element={<ProtectedRoute><HolaSuiteIA /></ProtectedRoute>} />
              <Route path="/opa-suite" element={<ProtectedRoute><OpaSuite /></ProtectedRoute>} />
              <Route path="/coming-soon" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
              <Route path="/coming-soon-ixc" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
              <Route path="/coming-soon-olli" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </EventProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
