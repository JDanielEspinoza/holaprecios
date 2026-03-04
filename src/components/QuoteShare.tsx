import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Share2, MessageCircle, Loader2, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuoteShareProps {
  quoteUrl: string;
  clientPhone?: string;
  agentName?: string;
}

export function QuoteShare({ quoteUrl, clientPhone, agentName }: QuoteShareProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

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

  const handleWhatsApp = useCallback(async () => {
    if (!clientPhone) return;
    const cleanPhone = clientPhone.replace(/[\s\-\+\(\)]/g, "");
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
        body: {
          phone: cleanPhone,
          agentName: agentName || "Tu asesor",
          linkPresupuesto: quoteUrl,
        },
      });
      if (error) throw error;
      setSent(true);
      toast.success("Cotización enviada por WhatsApp al cliente");
    } catch (err: any) {
      console.error("WhatsApp send error:", err);
      toast.error("Error al enviar por WhatsApp. Intentá de nuevo.");
    } finally {
      setSending(false);
    }
  }, [clientPhone, quoteUrl, agentName]);

  const hasPhone = !!clientPhone?.replace(/[\s\-\+\(\)]/g, "").trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Compartir Cotización
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* WhatsApp */}
        <div className="space-y-3">
          <Button
            onClick={handleWhatsApp}
            disabled={!hasPhone || sending || sent}
            className="w-full gap-2 bg-[#25D366] hover:bg-[#1da851] text-white"
            size="lg"
          >
            {sending ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</>
            ) : sent ? (
              <><CheckCircle className="h-5 w-5" /> Enviado por WhatsApp</>
            ) : (
              <><MessageCircle className="h-5 w-5" /> Enviar Cotización por WhatsApp</>
            )}
          </Button>
          {!hasPhone && (
            <p className="text-xs text-muted-foreground text-center">
              Completá el teléfono del cliente para habilitar WhatsApp
            </p>
          )}
        </div>

        {/* QR */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <QrCode className="h-4 w-4" />
            Código QR
          </div>
          <p className="text-xs text-muted-foreground">
            Escaneá el QR para ver la cotización en el celular y descargarla como PDF.
          </p>
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
