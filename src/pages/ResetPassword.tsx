import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoWisproIxc from "@/assets/logo-wispro-ixc.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error("Enlace de recuperación inválido");
      navigate("/login");
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success("Contraseña actualizada correctamente");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-sm rounded-2xl border-0 shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">
            <img src={logoWisproIxc} alt="Wispro + IXC" className="h-14 w-auto object-contain" />
          </div>
          <CardTitle className="text-lg font-semibold text-left">
            Restablecer contraseña
          </CardTitle>
          <p className="text-sm text-muted-foreground text-left">
            Ingresa tu nueva contraseña
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="h-12 w-12 text-primary" />
              <p className="text-sm text-muted-foreground">Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Nueva contraseña"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={6} 
                className="h-12 rounded-lg border-border/50 bg-background px-4" 
              />
              <Button type="submit" className="w-full h-11 rounded-lg btn-premium" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Actualizar contraseña
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
