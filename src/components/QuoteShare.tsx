import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Send, QrCode, Download, Loader2, Check, Link } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuoteShareProps {
  quoteHtml: string;
  quoteUrl: string;
}

const WEBHOOK_STORAGE_KEY = "zapier_webhook_url";

export function QuoteShare({ quoteHtml, quoteUrl }: QuoteShareProps) {
  const [email, setEmail] = useState("");
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem(WEBHOOK_STORAGE_KEY) || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSaveWebhook = useCallback((url: string) => {
    setWebhookUrl(url);
    localStorage.setItem(WEBHOOK_STORAGE_KEY, url);
  }, []);

  const handleSendEmail = useCallback(async () => {
    if (!email) {
      toast.error("Ingresá un email válido");
      return;
    }
    if (!webhookUrl) {
      toast.error("Ingresá tu URL de webhook de Zapier");
      return;
    }
    setSending(true);
    setSent(false);
    try {
      const { data, error } = await supabase.functions.invoke("send-quote", {
        body: {
          to: email,
          subject: "Tu Cotización - Hola Suite",
          quoteHtml,
          webhookUrl,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSent(true);
      toast.success("Cotización enviada a Zapier correctamente");
    } catch (err: any) {
      toast.error(err.message || "Error al enviar");
    } finally {
      setSending(false);
    }
  }, [email, quoteHtml, webhookUrl]);

  const downloadQR = useCallback(() => {
    const svg = document.getElementById("quote-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = "cotizacion-qr.png";
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Send className="h-5 w-5" />
          Compartir Cotización
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zapier Webhook */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Link className="h-4 w-4" />
            Webhook de Zapier
          </div>
          <Input
            type="url"
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            value={webhookUrl}
            onChange={(e) => handleSaveWebhook(e.target.value)}
            className="text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Pegá tu URL de webhook de Zapier. Se guardará para futuras cotizaciones.
          </p>
        </div>

        {/* Email */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Mail className="h-4 w-4" />
            Enviar por email
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="cliente@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSent(false);
              }}
              className="flex-1"
            />
            <Button onClick={handleSendEmail} disabled={sending || !email || !webhookUrl}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : sent ? (
                <Check className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="ml-2">{sent ? "Enviado" : "Enviar"}</span>
            </Button>
          </div>
        </div>

        {/* QR */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <QrCode className="h-4 w-4" />
            Código QR
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-lg border border-border">
              <QRCodeSVG id="quote-qr" value={quoteUrl} size={120} level="L" />
            </div>
            <Button variant="outline" onClick={downloadQR} className="gap-2">
              <Download className="h-4 w-4" />
              Descargar QR
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
