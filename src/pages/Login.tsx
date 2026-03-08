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
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Animated waves */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none z-[1]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: "45%" }}
      >
        <path
          className="animate-[wave1_8s_ease-in-out_infinite]"
          fill="rgba(255,255,255,0.06)"
          d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,229.3C672,235,768,213,864,186.7C960,160,1056,128,1152,128C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
        <path
          className="animate-[wave2_10s_ease-in-out_infinite]"
          fill="rgba(255,255,255,0.04)"
          d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,245.3C672,256,768,256,864,234.7C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
        <path
          className="animate-[wave3_12s_ease-in-out_infinite]"
          fill="rgba(255,255,255,0.03)"
          d="M0,256L48,261.3C96,267,192,277,288,261.3C384,245,480,203,576,197.3C672,192,768,224,864,240C960,256,1056,256,1152,240C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Top wave (inverted) */}
      <svg
        className="absolute top-0 left-0 w-full pointer-events-none z-[1] rotate-180"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: "30%" }}
      >
        <path
          className="animate-[wave2_9s_ease-in-out_infinite]"
          fill="rgba(255,255,255,0.04)"
          d="M0,160L60,170.7C120,181,240,203,360,192C480,181,600,139,720,138.7C840,139,960,181,1080,197.3C1200,213,1320,203,1380,197.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </svg>

      {/* Top bar with language and theme - fixed position */}
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
              <img src={logoHola} alt="Hola Suite" className="h-14 rounded-xl" />
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
