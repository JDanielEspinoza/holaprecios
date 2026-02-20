import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { pricingTiers, findTier, addons, holaCloudPlans } from "@/data/pricing";
import { Users, DollarSign, Zap, Cloud, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmt = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const Index = () => {
  const [clientCount, setClientCount] = useState(1000);
  const [addonQty, setAddonQty] = useState<Record<string, number>>(
    Object.fromEntries(addons.map((a) => [a.name, a.name === "Accesos extra" ? 15 : 0]))
  );

  const tier = useMemo(() => findTier(clientCount), [clientCount]);

  const addonTotal = useMemo(() => {
    return addons.reduce((sum, a) => {
      const qty = addonQty[a.name] || 0;
      if (a.name === "Accesos extra") {
        const extra = Math.max(0, qty - (a.included || 0));
        return sum + extra * a.unitPrice;
      }
      return sum + qty * a.unitPrice;
    }, 0);
  }, [addonQty]);

  const licenseBase = 170;
  const totalMensual = tier ? licenseBase + addonTotal : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            ¡Hola! Suite — Cotizador
          </h1>
          <p className="mt-1 text-muted-foreground">
            Calculá el costo mensual de tu ecosistema según la cantidad de clientes
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* Client input */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <span className="text-lg font-semibold text-foreground">Cantidad de Clientes</span>
              </div>
              <div className="flex-1 w-full md:max-w-md">
                <Input
                  type="number"
                  min={500}
                  max={100000}
                  step={100}
                  value={clientCount}
                  onChange={(e) => setClientCount(Math.max(500, Number(e.target.value)))}
                  className="text-2xl font-bold text-center h-14"
                />
              </div>
              <div className="flex-1 w-full">
                <Slider
                  value={[clientCount]}
                  onValueChange={([v]) => setClientCount(v)}
                  min={500}
                  max={100000}
                  step={100}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>500</span>
                  <span>100.000</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing results */}
        {tier && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <PriceCard
              title="Wispro"
              value={tier.wispro}
              icon={<Zap className="h-5 w-5" />}
              color="text-blue-500"
            />
            <PriceCard
              title="ACS"
              value={tier.acs}
              icon={<DollarSign className="h-5 w-5" />}
              color="text-emerald-500"
            />
            <PriceCard
              title="Hola Basic"
              value={tier.holaBasic}
              icon={<DollarSign className="h-5 w-5" />}
              color="text-amber-500"
            />
            <PriceCard
              title="Total Ecosistema"
              value={tier.total}
              icon={<DollarSign className="h-5 w-5" />}
              color="text-primary"
              highlight
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personalización */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personaliza tu ¡Hola! Suite</CardTitle>
              <p className="text-sm text-muted-foreground">
                HOLA BASIC: 1 WhatsApp oficial + hospedaje en META + 3 accesos
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-muted-foreground border-b border-border pb-2">
                <span>Servicio</span>
                <div className="flex gap-12">
                  <span>Cant.</span>
                  <span>Precio</span>
                  <span className="w-20 text-right">Subtotal</span>
                </div>
              </div>

              {/* Licencia base */}
              <div className="flex justify-between items-center text-sm py-1">
                <span className="font-medium text-foreground">Licencia base</span>
                <span className="font-semibold text-foreground">{fmt(licenseBase)}</span>
              </div>

              {addons.map((addon) => {
                const qty = addonQty[addon.name] || 0;
                const subtotal =
                  addon.name === "Accesos extra"
                    ? Math.max(0, qty - (addon.included || 0)) * addon.unitPrice
                    : qty * addon.unitPrice;
                return (
                  <div key={addon.name} className="flex justify-between items-center text-sm py-1">
                    <span className="text-foreground">{addon.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            setAddonQty((p) => ({
                              ...p,
                              [addon.name]: Math.max(0, (p[addon.name] || 0) - 1),
                            }))
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-mono">{qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            setAddonQty((p) => ({
                              ...p,
                              [addon.name]: (p[addon.name] || 0) + 1,
                            }))
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-muted-foreground w-14 text-right">
                        {fmt(addon.unitPrice)}
                      </span>
                      <span className="font-semibold w-20 text-right text-foreground">
                        {fmt(subtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-foreground">Total Mensual</span>
                <span className="text-2xl font-bold text-primary">{fmt(totalMensual)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Hola Cloud */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Hola Cloud
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {holaCloudPlans.map((plan) => (
                <div
                  key={plan.name}
                  className="flex justify-between items-center rounded-lg border border-border px-4 py-3 hover:bg-accent/50 transition-colors"
                >
                  <span className="font-medium text-foreground">{plan.name}</span>
                  <span className="font-bold text-foreground">{fmt(plan.price)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Installation */}
        {tier && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Instalación (único pago)</p>
                <p className="text-3xl font-bold text-foreground">{fmt(100)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Tier aplicado: {tier.clients.toLocaleString("es-AR")} clientes
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

function PriceCard({
  title,
  value,
  icon,
  color,
  highlight,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-2 border-primary bg-primary/5" : ""}>
      <CardContent className="pt-6 text-center">
        <div className={`flex items-center justify-center gap-2 mb-2 ${color}`}>
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <p className={`text-3xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
          {value.toLocaleString("es-AR", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
          })}
        </p>
        <p className="text-xs text-muted-foreground mt-1">/ mes</p>
      </CardContent>
    </Card>
  );
}

export default Index;
