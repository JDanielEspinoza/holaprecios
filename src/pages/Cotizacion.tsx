import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, User, Briefcase, Phone, Mail } from "lucide-react";
import logoHola from "@/assets/logo-hola.png";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtClients = (n: number) => n.toLocaleString("es-AR");

interface LineItem {
  label: string;
  value: number;
  section: string;
}

interface SellerProfile {
  nombre?: string;
  cargo?: string;
  numero?: string;
  email_contacto?: string;
}

const Cotizacion = () => {
  const [params] = useSearchParams();

  const data = useMemo(() => {
    try {
      const encoded = params.get("d");
      if (!encoded) return null;
      return JSON.parse(decodeURIComponent(atob(encoded)));
    } catch {
      return null;
    }
  }, [params]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cotización no encontrada.</p>
      </div>
    );
  }

  const { clients, items, discount, total, discountedTotal, discountAmount, installationCost, seller } = data as {
    clients: number;
    items: LineItem[];
    discount: number;
    total: number;
    discountedTotal: number;
    discountAmount: number;
    installationCost?: number;
    seller?: SellerProfile;
  };

  const ecosystem = items.filter((i: LineItem) => i.section === "eco");
  const hola = items.filter((i: LineItem) => i.section === "hola");
  const cloud = items.filter((i: LineItem) => i.section === "cloud");
  const finalTotal = discount > 0 ? discountedTotal : total;

  const handleDownloadPDF = () => {
    window.print();
  };

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
        {/* Download button */}
        <div className="w-full max-w-lg mb-4 no-print">
          <Button onClick={handleDownloadPDF} className="w-full gap-2" size="lg">
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
              Detalle para {fmtClients(clients)} clientes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {ecosystem.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Ecosistema
                </h3>
                {ecosystem.map((item: LineItem) => (
                  <SummaryLine key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            )}

            {hola.length > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Personalización Hola
                </h3>
                {hola.map((item: LineItem) => (
                  <SummaryLine key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            )}

            {cloud.length > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Cloud
                </h3>
                {cloud.map((item: LineItem) => (
                  <SummaryLine key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            )}

            <div className="border-t-2 border-primary/30 pt-4 space-y-3">
              {discount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground">Descuento ({discount}%)</span>
                  <span className="font-semibold text-emerald-600">-{fmt(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold text-foreground">Total Mensual</p>
                  <p className="text-xs text-muted-foreground">Ecosistema + Personalización + Cloud</p>
                </div>
                <div className="text-right">
                  {discount > 0 && (
                    <p className="text-lg text-muted-foreground line-through">{fmt(total)}</p>
                  )}
                  <p className="text-4xl font-bold text-primary">{fmt(finalTotal)}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Instalación (único pago)</p>
              <p className="text-lg font-bold text-foreground">{fmt(installationCost ?? 100)}</p>
            </div>

            {/* Seller profile footer */}
            {seller && (seller.nombre || seller.cargo || seller.numero || seller.email_contacto) && (
              <div className="border-t border-border pt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tu asesor</p>
                <div className="space-y-1">
                  {seller.nombre && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{seller.nombre}</span>
                    </div>
                  )}
                  {seller.cargo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{seller.cargo}</span>
                    </div>
                  )}
                  {seller.numero && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{seller.numero}</span>
                    </div>
                  )}
                  {seller.email_contacto && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{seller.email_contacto}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
