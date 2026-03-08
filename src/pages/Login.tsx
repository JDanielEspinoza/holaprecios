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
import fondoLogin from "@/assets/fondo-login.jpg";

type Language = "es" | "pt" | "en";

// Define translations for different languages
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
}> = {
  es: {
    title: "Iniciar sesión",
    registerTitle: "Crear cuenta",
    email: "Email",
    password: "Contraseña",
    login: "Ingresar",
    register: "Registrarse",
    hasAccount: "Ya tengo cuenta",
    createAccount: "Crear cuenta nueva",
    successRegister: "Registro exitoso. Revisá tu email para confirmar tu cuenta.",
    authError: "Error de autenticación",
  },
  pt: {
    title: "Entrar",
    registerTitle: "Criar conta",
    email: "E-mail",
    password: "Senha",
    login: "Entrar",
    register: "Registrar",
    hasAccount: "Já tenho conta",
    createAccount: "Criar conta nova",
    successRegister: "Registro bem-sucedido. Verifique seu e-mail para confirmar sua conta.",
    authError: "Erro de autenticação",
  },
  en: {
    title: "Sign in",
    registerTitle: "Create account",
    email: "Email",
    password: "Password",
    login: "Sign in",
    register: "Sign up",
    hasAccount: "Already have an account",
    createAccount: "Create new account",
    successRegister: "Registration successful. Check your email to confirm your account.",
    authError: "Authentication error",
  },
};

// Generate stable particle positions
const particles = Array.from({ length: 24 }, (_, i) => ({
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

  const t = translations[language];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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

  return (
    <div 
      className="min-h-screen flex items-center justify-center lg:justify-end bg-cover bg-center bg-no-repeat relative overflow-hidden"
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

      {/* Top bar with language and theme */}
      <div className="absolute top-0 right-0 flex items-center gap-3 p-4 z-20">
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

      {/* Login card - floating */}
      <div className="relative z-10 w-full max-w-sm mx-4 lg:mr-16 xl:mr-24">
        <Card className="bg-background/95 backdrop-blur-md rounded-2xl border-0 shadow-2xl animate-fade-slide-up">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <img src={logoWisproIxc} alt="Wispro + IXC" className="h-12 w-auto object-contain" />
            </div>
            <CardTitle className="text-xl font-semibold">
              {isRegister ? t.registerTitle : t.title}
            </CardTitle>
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
  );
};

export default Login;
