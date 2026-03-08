import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Sun, Moon, Globe } from "lucide-react";
import logoWisproIxc from "@/assets/logo-wispro-ixc.png";
import logoWispro from "@/assets/logo-wispro.png";
import logoAcs from "@/assets/logo-acs.png";
import logoHola from "@/assets/logo-hola.png";
import fondoLogin from "@/assets/fondo-login.jpg";

type Language = "es" | "pt" | "en";

const translations: Record<Language, {
  title: string;
  registerTitle: string;
  email: string;
  password: string;
  login: string;
  register: string;
  hasAccount: string;
  createAccount: string;
  successRegister: string;
  authError: string;
  subtitle: string;
}> = {
  es: {
    title: "Inicia sesión en tu cuenta",
    registerTitle: "Crear cuenta",
    email: "Correo electrónico",
    password: "Contraseña",
    login: "Iniciar sesión",
    register: "Registrarse",
    hasAccount: "Ya tengo cuenta",
    createAccount: "Crear cuenta nueva",
    successRegister: "Registro exitoso. Revisá tu email para confirmar tu cuenta.",
    authError: "Error de autenticación",
    subtitle: "Creá y presentá cotizaciones profesionales a tus clientes",
  },
  pt: {
    title: "Entre em sua conta",
    registerTitle: "Criar conta",
    email: "E-mail",
    password: "Senha",
    login: "Entrar",
    register: "Registrar",
    hasAccount: "Já tenho conta",
    createAccount: "Criar conta nova",
    successRegister: "Registro bem-sucedido. Verifique seu e-mail para confirmar sua conta.",
    authError: "Erro de autenticação",
    subtitle: "Crie e apresente cotações profissionais para seus clientes",
  },
  en: {
    title: "Sign in to your account",
    registerTitle: "Create account",
    email: "Email",
    password: "Password",
    login: "Sign in",
    register: "Sign up",
    hasAccount: "Already have an account",
    createAccount: "Create new account",
    successRegister: "Registration successful. Check your email to confirm your account.",
    authError: "Authentication error",
    subtitle: "Create and present professional quotes for your clients",
  },
};

const slides = [
  {
    logo: logoWispro,
    name: "Wispro",
    headline: "Gestión integral para ISPs",
    description: "Facturación, CRM, soporte técnico y control de red en una sola plataforma.",
    color: "from-cyan-500/20 to-teal-500/20",
  },
  {
    logo: logoHola,
    name: "Hola! Suite",
    headline: "Atención omnichannel inteligente",
    description: "WhatsApp oficial, chatbots con IA y múltiples canales unificados para tu equipo.",
    color: "from-purple-500/20 to-indigo-500/20",
    rounded: true,
  },
  {
    logo: logoAcs,
    name: "ACS",
    headline: "Automatización y control de servicios",
    description: "Activa, suspende y gestiona servicios de forma automática desde cualquier lugar.",
    color: "from-blue-500/20 to-sky-500/20",
  },
];

const particles = Array.from({ length: 20 }, (_, i) => ({
  size: 3 + (i * 7 % 5),
  left: (i * 17 + 5) % 100,
  top: (i * 23 + 10) % 100,
  duration: 8 + (i % 4) * 3,
  delay: (i * 0.7) % 5,
  variant: (i % 3) + 1,
}));

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>("es");
  const [darkMode, setDarkMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const t = translations[language];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success(t.successRegister);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message || t.authError);
    } finally {
      setLoading(false);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div 
      className="min-h-screen flex bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: `url(${fondoLogin})` }}
    >
      {/* Particle animation styles */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          25% { transform: translate(15px, -20px) scale(1.2); opacity: 0.3; }
          50% { transform: translate(-10px, -35px) scale(1); opacity: 0.2; }
          75% { transform: translate(20px, -15px) scale(0.8); opacity: 0.25; }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
          33% { transform: translate(-20px, -25px) scale(1.3); opacity: 0.25; }
          66% { transform: translate(15px, -40px) scale(0.9); opacity: 0.2; }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(0.8); opacity: 0.2; }
          50% { transform: translate(25px, -30px) scale(1.1); opacity: 0.35; }
        }
        @keyframes slideContent {
          0% { opacity: 0; transform: translateY(20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/15" />

      {/* Floating particles */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animation: `float${p.variant} ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Left side - Carousel (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center relative z-10 p-12 xl:p-20">
        <div className="max-w-lg w-full">
          {/* Slide content */}
          <div 
            key={currentSlide}
            className="text-center"
            style={{ animation: "slideContent 5s ease-in-out" }}
          >
            {/* Product card */}
            <div className={`bg-gradient-to-br ${slide.color} backdrop-blur-md border border-white/20 rounded-2xl p-10 mb-8 shadow-2xl`}>
              <div className="flex justify-center mb-6">
                <img 
                  src={slide.logo} 
                  alt={slide.name} 
                  className={`h-20 w-auto object-contain ${slide.rounded ? "rounded-2xl" : ""}`}
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">{slide.headline}</h2>
              <p className="text-white/80 text-base leading-relaxed">{slide.description}</p>
            </div>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx === currentSlide 
                    ? "w-8 bg-white" 
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login */}
      <div className="w-full lg:w-auto lg:min-w-[420px] xl:min-w-[460px] flex flex-col min-h-screen relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-end gap-3 p-4">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="w-[120px] h-8 border-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">
                  <span className="flex items-center gap-2">🇪🇸 Español</span>
                </SelectItem>
                <SelectItem value="pt">
                  <span className="flex items-center gap-2">🇧🇷 Português</span>
                </SelectItem>
                <SelectItem value="en">
                  <span className="flex items-center gap-2">🇺🇸 English</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className="h-9 w-9 bg-background/90 backdrop-blur-sm hover:bg-background"
            title={darkMode ? "Modo claro" : "Modo oscuro"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Login card */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
          <Card className="w-full max-w-sm bg-background/95 backdrop-blur-md rounded-2xl border-0 shadow-2xl animate-fade-slide-up">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-4">
                <img src={logoWisproIxc} alt="Wispro + IXC" className="h-14 w-auto object-contain" />
              </div>
              <CardTitle className="text-lg font-semibold text-left">
                {isRegister ? t.registerTitle : t.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground text-left">
                {t.subtitle}
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">{t.email}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="h-11 rounded-lg border-border/50 bg-background" 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm">{t.password}</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength={6} 
                    className="h-11 rounded-lg border-border/50 bg-background" 
                  />
                </div>
                <Button type="submit" className="w-full h-11 rounded-lg btn-premium" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isRegister ? t.register : t.login}
                </Button>
              </form>
              <Button 
                variant="link" 
                className="w-full mt-1 text-sm" 
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? t.hasAccount : t.createAccount}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
