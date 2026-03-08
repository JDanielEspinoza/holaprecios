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
    <div className="min-h-screen flex">
      {/* Left side - Background image (hidden on mobile) */}
      <div 
        className="hidden lg:flex lg:w-3/5 xl:w-2/3 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${fondoLogin})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col min-h-screen bg-background">
        {/* Top bar with language and theme */}
        <div className="flex items-center justify-end gap-3 p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="w-[130px] h-9">
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
            className="h-9 w-9"
            title={darkMode ? "Modo claro" : "Modo oscuro"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Login form centered */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
          <Card className="w-full max-w-sm card-premium animate-fade-slide-up border-0 shadow-premium">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <img src={logoHola} alt="Hola Suite" className="h-16 rounded-xl" />
              </div>
              <CardTitle className="text-xl">
                {isRegister ? t.registerTitle : t.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="input-premium h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t.password}</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    minLength={6} 
                    className="input-premium h-11" 
                  />
                </div>
                <Button type="submit" className="w-full btn-premium h-11" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {isRegister ? t.register : t.login}
                </Button>
              </form>
              <Button 
                variant="link" 
                className="w-full mt-2" 
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
