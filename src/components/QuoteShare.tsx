import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Share2, MessageCircle, Loader2, CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";

interface QuoteShareProps {
  quoteUrl: string;
  clientPhone?: string;
  clientName?: string;
  agentName?: string;
}

type SendResult = {
  status: "success" | "error";
  title: string;
  detail: string;
  raw?: string;
} | null;

export function QuoteShare({ quoteUrl, clientPhone, clientName, agentName }: QuoteShareProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState<SendResult>(null);

  const [sendingRegistro, setSendingRegistro] = useState(false);
  const [sentRegistro, setSentRegistro] = useState(false);
  const [resultRegistro, setResultRegistro] = useState<SendResult>(null);

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
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
        body: {
          phone: cleanPhone,
          agentName: agentName || "Tu asesor",
          linkPresupuesto: quoteUrl,
        },
      });

      if (error) {
        setResult({
          status: "error",
          title: "Error en el envío",
          detail: error.message || "No se pudo conectar con el servicio de mensajería.",
          raw: JSON.stringify(error, null, 2),
        });
        return;
      }

      // Parse webhook response for more detail
      const webhookResp = data?.webhook_response || "";
      const isSuccess = data?.success === true;

      if (isSuccess) {
        setSent(true);
        setResult({
          status: "success",
          title: "Enviado correctamente",
          detail: `La cotización fue enviada por WhatsApp al número ${cleanPhone}.`,
          raw: webhookResp,
        });
      } else {
        // Try to detect common failure reasons
        const lowerResp = (webhookResp + JSON.stringify(data)).toLowerCase();
        let detail = "El servicio respondió pero el mensaje podría no haberse entregado.";
        if (lowerResp.includes("block") || lowerResp.includes("spam")) {
          detail = "Posible bloqueo de Meta: el número puede tener restricciones de WhatsApp Business.";
        } else if (lowerResp.includes("invalid") || lowerResp.includes("not found")) {
          detail = "Número inválido o no registrado en WhatsApp.";
        } else if (lowerResp.includes("rate") || lowerResp.includes("limit")) {
          detail = "Límite de envío alcanzado. Intentá de nuevo en unos minutos.";
        }
        setResult({
          status: "error",
          title: "Respuesta inesperada",
          detail,
          raw: webhookResp || JSON.stringify(data, null, 2),
        });
      }
    } catch (err: any) {
      console.error("WhatsApp send error:", err);
      setResult({
        status: "error",
        title: "Error de conexión",
        detail: "No se pudo conectar con el servidor. Verificá tu conexión a internet.",
        raw: err.message,
      });
    } finally {
      setSending(false);
    }
  }, [clientPhone, quoteUrl, agentName]);

  const handleRegistroWispro = useCallback(async () => {
    if (!clientPhone) return;
    const cleanPhone = clientPhone.replace(/[\s\-\+\(\)]/g, "");
    setSendingRegistro(true);
    setResultRegistro(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-registro-wispro", {
        body: {
          phone: cleanPhone,
          firstName: clientName || "",
          agentName: agentName || "Tu asesor",
        },
      });

      if (error) {
        setResultRegistro({
          status: "error",
          title: "Error en el envío",
          detail: error.message || "No se pudo conectar con el servicio.",
          raw: JSON.stringify(error, null, 2),
        });
        return;
      }

      const isSuccess = data?.success === true;
      if (isSuccess) {
        setSentRegistro(true);
        setResultRegistro({
          status: "success",
          title: "Enlace enviado",
          detail: `El enlace de registro Wispro fue enviado al ${cleanPhone}.`,
          raw: data?.webhook_response || "",
        });
      } else {
        setResultRegistro({
          status: "error",
          title: "Respuesta inesperada",
          detail: "El servicio respondió pero el mensaje podría no haberse entregado.",
          raw: data?.webhook_response || JSON.stringify(data, null, 2),
        });
      }
    } catch (err: any) {
      setResultRegistro({
        status: "error",
        title: "Error de conexión",
        detail: "No se pudo conectar con el servidor.",
        raw: err.message,
      });
    } finally {
      setSendingRegistro(false);
    }
  }, [clientPhone, clientName, agentName]);

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

        {/* Result dialog */}
        {result && (
          <div className={`rounded-lg border p-4 space-y-2 animate-fade-slide-up ${
            result.status === "success"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {result.status === "success" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                <p className={`text-sm font-semibold ${
                  result.status === "success" ? "text-emerald-700" : "text-red-700"
                }`}>
                  {result.title}
                </p>
              </div>
              <button onClick={() => setResult(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className={`text-xs ${
              result.status === "success" ? "text-emerald-600" : "text-red-600"
            }`}>
              {result.detail}
            </p>
            {result.raw && (
              <details className="text-[10px] text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">Ver respuesta técnica</summary>
                <pre className="mt-1 p-2 bg-white/60 rounded text-[10px] overflow-x-auto whitespace-pre-wrap break-all">
                  {result.raw}
                </pre>
              </details>
            )}
            {result.status === "error" && (
              <Button
                onClick={() => { setResult(null); setSent(false); }}
                variant="outline"
                size="sm"
                className="mt-2 gap-1.5 text-xs border-red-200 text-red-700 hover:bg-red-100"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Reintentar envío
              </Button>
            )}
          </div>
        )}

        {/* Registro Wispro */}
        <div className="space-y-3">
          <Button
            onClick={handleRegistroWispro}
            disabled={!hasPhone || sendingRegistro || sentRegistro}
            className="w-full gap-2 bg-[#25D366] hover:bg-[#1da851] text-white"
            size="lg"
          >
            {sendingRegistro ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</>
            ) : sentRegistro ? (
              <><CheckCircle className="h-5 w-5" /> Enlace Enviado</>
            ) : (
              <><MessageCircle className="h-5 w-5" /> Enlace Para Registro Wispro</>
            )}
          </Button>
        </div>

        {/* Registro result */}
        {resultRegistro && (
          <div className={`rounded-lg border p-4 space-y-2 animate-fade-slide-up ${
            resultRegistro.status === "success"
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {resultRegistro.status === "success" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                <p className={`text-sm font-semibold ${
                  resultRegistro.status === "success" ? "text-emerald-700" : "text-red-700"
                }`}>
                  {resultRegistro.title}
                </p>
              </div>
              <button onClick={() => setResultRegistro(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className={`text-xs ${
              resultRegistro.status === "success" ? "text-emerald-600" : "text-red-600"
            }`}>
              {resultRegistro.detail}
            </p>
            {resultRegistro.raw && (
              <details className="text-[10px] text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">Ver respuesta técnica</summary>
                <pre className="mt-1 p-2 bg-white/60 rounded text-[10px] overflow-x-auto whitespace-pre-wrap break-all">
                  {resultRegistro.raw}
                </pre>
              </details>
            )}
            {resultRegistro.status === "error" && (
              <Button
                onClick={() => { setResultRegistro(null); setSentRegistro(false); }}
                variant="outline"
                size="sm"
                className="mt-2 gap-1.5 text-xs border-red-200 text-red-700 hover:bg-red-100"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Reintentar envío
              </Button>
            )}
          </div>
        )}

        {/* Download + QR */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => window.open(quoteUrl, "_blank")}
            className="w-full gap-2"
            size="lg"
          >
            <Download className="h-5 w-5" />
            Descargar Cotización
          </Button>
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-lg border border-border">
              <QRCodeSVG id="quote-qr" value={quoteUrl} size={100} level="L" />
            </div>
            <p className="text-xs text-muted-foreground">
              Escaneá el QR para ver la cotización en el celular.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
