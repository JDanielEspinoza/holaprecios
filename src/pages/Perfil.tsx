import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Save, Upload, User } from "lucide-react";
import logoWispro from "@/assets/logo-wispro.png";
import logoAcs from "@/assets/logo-acs.png";
import AppMenu from "@/components/AppMenu";

const Perfil = () => {
  const { profile, loading, updateProfile, uploadPhoto } = useProfile();
  const [form, setForm] = useState({ nombre: "", cargo: "", email_contacto: "", numero: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        nombre: profile.nombre,
        cargo: profile.cargo,
        email_contacto: profile.email_contacto,
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const error = await updateProfile({ ...form, numero: FIXED_PHONE });
    if (error) toast.error("Error al guardar");
    else toast.success("Perfil actualizado");
    setSaving(false);
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadPhoto(file);
    if (url) toast.success("Foto actualizada");
    else toast.error("Error al subir foto");
    setUploading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-premium-gradient p-4">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="fixed top-4 left-4 z-50">
          <AppMenu />
        </div>

        <Card className="card-premium animate-fade-slide-up-1">
          <CardHeader>
            <CardTitle>Mi Perfil</CardTitle>
            <p className="text-sm text-muted-foreground">
              Estos datos aparecerán en el pie de tus cotizaciones.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo */}
            <div className="space-y-2">
              <Label>Foto de perfil</Label>
              <p className="text-xs text-muted-foreground">
                Tu foto será usada en la parte superior de la cotización. Si no subís una, se mostrará el logo Wispro + IXC Soft por defecto.
              </p>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full border-2 border-primary/20 overflow-hidden bg-muted flex items-center justify-center animate-glow-pulse">
                  {profile?.foto_url ? (
                    <img src={profile.foto_url} alt="Foto" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex gap-1">
                      <img src={logoWispro} alt="Wispro" className="h-8 w-auto" />
                      <img src={logoAcs} alt="IXC" className="h-8 w-auto" />
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploading ? "Subiendo..." : "Cambiar foto"}
                    </div>
                  </Label>
                  <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input id="nombre" value={form.nombre} onChange={(e) => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Ej: Jorthy Carvajal" className="input-premium" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" value={form.cargo} onChange={(e) => setForm(f => ({...f, cargo: e.target.value}))} placeholder="Ej: SDR Hola! Suite" className="input-premium" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_contacto">Email de contacto</Label>
                <Input id="email_contacto" type="email" value={form.email_contacto} onChange={(e) => setForm(f => ({...f, email_contacto: e.target.value}))} placeholder="Ej: jorthy@opasuite.com.br" className="input-premium" />
              </div>
              <div className="space-y-2">
                <Label>Número de teléfono</Label>
                <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground">
                  {FIXED_PHONE}
                </div>
                <p className="text-xs text-muted-foreground">Este número es fijo para todos los usuarios.</p>
              </div>
              <Button type="submit" className="w-full btn-premium" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Perfil;
