import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import logoHola from "@/assets/logo-hola.png";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
        toast.success("Registro exitoso. Revisá tu email para confirmar tu cuenta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(260,60%,97%)] via-[hsl(230,60%,96%)] to-[hsl(200,60%,97%)] animate-gradient-shift">
      <Card className="w-full max-w-sm card-premium animate-fade-slide-up border-0 shadow-premium">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logoHola} alt="Hola Suite" className="h-16 rounded-xl" />
          </div>
          <CardTitle>{isRegister ? "Crear cuenta" : "Iniciar sesión"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-premium" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-premium" />
            </div>
            <Button type="submit" className="w-full btn-premium" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isRegister ? "Registrarse" : "Ingresar"}
            </Button>
          </form>
          <Button variant="link" className="w-full mt-2" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Ya tengo cuenta" : "Crear cuenta nueva"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
