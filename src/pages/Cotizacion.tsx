import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, User, Briefcase, Phone, Mail, Loader2, Building } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import logoHola from "@/assets/logo-hola.png";
import { supabase } from "@/integrations/supabase/client";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtClients = (n: number) => n.toLocaleString("es-AR");

interface LineItem {
  label: string;
  value: number;
  section: string;
}

interface QuoteData {
  clients_count: number;
  items: LineItem[];
  discount: number;
  total: number;
  discounted_total: number;
  discount_amount: number;
  installation_cost: number;
  seller_name: string;
  seller_cargo: string;
  seller_numero: string;
  seller_email: string;
  seller_foto: string | null;
  client_name: string;
  client_company: string;
  client_phone: string;
  client_email: string;
  created_at: string;
}

const Cotizacion = () => {
  const [params] = useSearchParams();
  const [data, setData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const id = params.get("id");
    if (!id) { setLoading(false); setError(true); return; }

    supabase.from("quotes" as any).select("*").eq("id", id).single()
      .then(({ data: row, error: err }) => {
        if (err || !row) { setError(true); }
        else { setData(row as any); }
        setLoading(false);
      });
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cotización no encontrada.</p>
      </div>
    );
  }

  const items = (data.items || []) as LineItem[];
  const ecosystem = items.filter((i) => i.section === "eco");
  const hola = items.filter((i) => i.section === "hola");
  const cloud = items.filter((i) => i.section === "cloud");
  const finalTotal = data.discount > 0 ? data.discounted_total : data.total;

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; }
          .print-card { border: none !important; box-shadow: none !important; }
        }
      `}</style>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 print-container">
        <div className="w-full max-w-lg mb-4 no-print">
          <Button onClick={() => window.print()} className="w-full gap-2" size="lg">
            <Download className="h-5 w-5" />
            Descargar PDF
          </Button>
        </div>

        <Card className="w-full max-w-lg border-2 border-primary/30 bg-primary/5 print-card">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <img src={logoHola} alt="Hola Suite" className="h-12 rounded-xl" />
            </div>
            <CardTitle className="text-xl">Resumen de Cotización</CardTitle>
            <p className="text-sm text-muted-foreground">
              Detalle para {fmtClients(data.clients_count)} clientes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client info */}
            {(data.client_name || data.client_company) && (
              <div className="space-y-1 pb-2">
                {data.client_name && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{data.client_name}</span>
                  </div>
                )}
                {data.client_company && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-3.5 w-3.5" />
                    <span>{data.client_company}</span>
                  </div>
                )}
              </div>
            )}

            {ecosystem.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ecosistema</h3>
                {ecosystem.map((item) => <SummaryLine key={item.label} label={item.label} value={item.value} />)}
              </div>
            )}

            {hola.length > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personalización Hola</h3>
                {hola.map((item) => <SummaryLine key={item.label} label={item.label} value={item.value} />)}
              </div>
            )}

            {cloud.length > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Cloud</h3>
                {cloud.map((item) => <SummaryLine key={item.label} label={item.label} value={item.value} />)}
              </div>
            )}

            <div className="border-t-2 border-primary/30 pt-4 space-y-3">
              {data.discount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground">Descuento ({data.discount}%)</span>
                  <span className="font-semibold text-emerald-600">-{fmt(data.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold text-foreground">Total Mensual</p>
                  <p className="text-xs text-muted-foreground">Ecosistema + Personalización + Cloud</p>
                </div>
                <div className="text-right">
                  {data.discount > 0 && (
                    <p className="text-lg text-muted-foreground line-through">{fmt(data.total)}</p>
                  )}
                  <p className="text-4xl font-bold text-primary">{fmt(finalTotal)}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Instalación (único pago)</p>
              <p className="text-lg font-bold text-foreground">{fmt(data.installation_cost ?? 100)}</p>
            </div>

            {/* Seller profile footer */}
            {(data.seller_name || data.seller_cargo || data.seller_numero || data.seller_email) && (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tu asesor</p>
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    {data.seller_foto ? (
                      <AvatarImage src={data.seller_foto} alt={data.seller_name || "Asesor"} />
                    ) : null}
                    <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                      {(data.seller_name || "?").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    {data.seller_name && (
                      <p className="text-sm font-semibold text-foreground">{data.seller_name}</p>
                    )}
                    {data.seller_cargo && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Briefcase className="h-3 w-3" />
                        <span>{data.seller_cargo}</span>
                      </div>
                    )}
                    {data.seller_numero && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{data.seller_numero}</span>
                      </div>
                    )}
                    {data.seller_email && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{data.seller_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Validity text */}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-center text-muted-foreground italic">
                Cotización válida hasta el 12 de Marzo, mientras dure el evento Andina Link.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

function SummaryLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-sm py-1 text-foreground">
      <span>{label}</span>
      <span className="font-semibold">{fmt(value)}</span>
    </div>
  );
}

export default Cotizacion;
