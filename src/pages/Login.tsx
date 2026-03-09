import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import loginWoman from "@/assets/login-woman.png";

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
  rememberMe: string;
  forgotPassword: string;
  forgotTitle: string;
  forgotSubtitle: string;
  sendLink: string;
  backToLogin: string;
  forgotSuccess: string;
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
    subtitle: "Crea y presenta cotizaciones profesionales a tus clientes",
    rememberMe: "Recordar correo electrónico",
    forgotPassword: "¿Olvidó la contraseña?",
    forgotTitle: "Recuperar contraseña",
    forgotSubtitle: "Te enviaremos un enlace para restablecer tu contraseña",
    sendLink: "Enviar enlace",
    backToLogin: "Volver al inicio de sesión",
    forgotSuccess: "Revisá tu email para restablecer tu contraseña.",
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
    rememberMe: "Lembrar e-mail",
    forgotPassword: "Esqueceu a senha?",
    forgotTitle: "Recuperar senha",
    forgotSubtitle: "Enviaremos um link para redefinir sua senha",
    sendLink: "Enviar link",
    backToLogin: "Voltar ao login",
    forgotSuccess: "Verifique seu e-mail para redefinir sua senha.",
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
    rememberMe: "Remember email",
    forgotPassword: "Forgot password?",
    forgotTitle: "Reset password",
    forgotSubtitle: "We'll send you a link to reset your password",
    sendLink: "Send link",
    backToLogin: "Back to sign in",
    forgotSuccess: "Check your email to reset your password.",
  },
};


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
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>("es");
  const [darkMode, setDarkMode] = useState(false);
  

  const t = translations[language];

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem("remembered_email");
    if (saved) {
      setEmail(saved);
      setRememberEmail(true);
    }
  }, []);

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

    // Save or clear remembered email
    if (rememberEmail) {
      localStorage.setItem("remembered_email", email);
    } else {
      localStorage.removeItem("remembered_email");
    }

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success(t.forgotSuccess);
    } catch (err: any) {
      toast.error(err.message || t.authError);
    } finally {
      setLoading(false);
    }
  };

  

  const renderCardTitle = () => {
    if (isForgot) return t.forgotTitle;
    if (isRegister) return t.registerTitle;
    return t.title;
  };

  const renderCardSubtitle = () => {
    if (isForgot) return t.forgotSubtitle;
    return t.subtitle;
  };

  return (
    <div 
      className="min-h-screen flex bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: `url(${fondoLogin})` }}
    >
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

      <div className="absolute inset-0 bg-black/15" />

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

      {/* Left side - Carousel */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center relative z-10 p-12 xl:p-20">
        <div className="max-w-lg w-full">
          <div 
            key={currentSlide}
            className="text-center"
            style={{ animation: "slideContent 5s ease-in-out" }}
          >
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

        <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
          <Card className="w-full max-w-sm bg-background/95 backdrop-blur-md rounded-2xl border-0 shadow-2xl animate-fade-slide-up">
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-6">
                <img src={logoWisproIxc} alt="Wispro + IXC" className="h-18 w-auto object-contain" />
              </div>
              <CardTitle className="text-lg font-semibold text-left">
                {renderCardTitle()}
              </CardTitle>
              <p className="text-sm text-muted-foreground text-left mt-1">
                {renderCardSubtitle()}
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              {isForgot ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <Input 
                    type="email" 
                    placeholder={t.email}
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="h-12 rounded-lg border-border/50 bg-background px-4" 
                  />
                  <Button type="submit" className="w-full h-11 rounded-lg btn-premium" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {t.sendLink}
                  </Button>
                  <Button 
                    variant="link" 
                    className="w-full text-sm" 
                    onClick={() => setIsForgot(false)}
                  >
                    {t.backToLogin}
                  </Button>
                </form>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                      type="email" 
                      placeholder={t.email}
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="h-12 rounded-lg border-border/50 bg-background px-4" 
                    />
                    {!isRegister && (
                      <Input 
                        type="password" 
                        placeholder={t.password}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        minLength={6} 
                        className="h-12 rounded-lg border-border/50 bg-background px-4" 
                      />
                    )}
                    {isRegister && (
                      <Input 
                        type="password" 
                        placeholder={t.password}
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        minLength={6} 
                        className="h-12 rounded-lg border-border/50 bg-background px-4" 
                      />
                    )}
                    {!isRegister && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            id="remember" 
                            checked={rememberEmail}
                            onCheckedChange={(checked) => setRememberEmail(checked === true)}
                          />
                          <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
                            {t.rememberMe}
                          </label>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setIsForgot(true)}
                          className="text-xs text-primary hover:underline"
                        >
                          {t.forgotPassword}
                        </button>
                      </div>
                    )}
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
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
