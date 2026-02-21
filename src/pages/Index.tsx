import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingTiers, addons, holaCloudPlans } from "@/data/pricing";
import { Users, DollarSign, Zap, Cloud, Plus, Minus, Check, RotateCcw } from "lucide-react";
import holaBanner from "@/assets/holabanner.jpg";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fmt = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const fmtClients = (n: number) => n.toLocaleString("es-AR");

const Index = () => {
  const [clientCount, setClientCount] = useState(1000);
  const [selectedProducts, setSelectedProducts] = useState({
    wispro: true,
    acs: true,
    holaBasic: true,
  });
  const [discount, setDiscount] = useState(0);
  const [addonQty, setAddonQty] = useState<Record<string, number>>(
    Object.fromEntries(addons.map((a) => [a.name, 0]))
  );
  const [selectedCloud, setSelectedCloud] = useState<string | null>(null);

  const tier = useMemo(
    () => pricingTiers.find((t) => t.clients === clientCount) || pricingTiers[0],
    [clientCount]
  );

  const ecosystemTotal = useMemo(() => {
    let sum = 0;
    if (selectedProducts.wispro) sum += tier.wispro;
    if (selectedProducts.acs) sum += tier.acs;
    if (selectedProducts.holaBasic) sum += tier.holaBasic;
    return sum;
  }, [tier, selectedProducts]);

  const addonTotal = useMemo(() => {
    return addons.reduce((sum, a) => {
      const qty = addonQty[a.name] || 0;
      return sum + qty * a.unitPrice;
    }, 0);
  }, [addonQty]);

  const cloudPrice = useMemo(() => {
    if (!selectedCloud) return 0;
    return holaCloudPlans.find((p) => p.name === selectedCloud)?.price || 0;
  }, [selectedCloud]);

  const licenseBase = selectedProducts.holaBasic ? tier.holaBasic : 0;
  const grandTotal = ecosystemTotal + addonTotal + cloudPrice;

  const toggleProduct = (key: keyof typeof selectedProducts) => {
    setSelectedProducts((p) => ({ ...p, [key]: !p[key] }));
  };

  const resetAll = () => {
    setSelectedProducts({ wispro: false, acs: false, holaBasic: false });
    setAddonQty(Object.fromEntries(addons.map((a) => [a.name, 0])));
    setSelectedCloud(null);
    setDiscount(0);
  };

  const discountAmount = grandTotal * (discount / 100);
  const discountedTotal = grandTotal - discountAmount;

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <header>
        <img src={holaBanner} alt="¡Hola! Suite — Servicio de atención omnichannel que conecta personas" className="w-full h-auto object-cover" />
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* Client selector */}
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <span className="text-lg font-semibold text-foreground">Cantidad de Clientes</span>
              </div>
              <div className="w-full md:max-w-xs">
                <Select
                  value={String(clientCount)}
                  onValueChange={(v) => setClientCount(Number(v))}
                >
                  <SelectTrigger className="text-xl font-bold h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingTiers.map((t) => (
                      <SelectItem key={t.clients} value={String(t.clients)}>
                        {fmtClients(t.clients)} clientes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={resetAll}
                title="Reiniciar todo"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ecosystem products with checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ProductCard
            title="Wispro"
            value={tier.wispro}
            icon={<Zap className="h-5 w-5" />}
            color="text-blue-500"
            checked={selectedProducts.wispro}
            onToggle={() => toggleProduct("wispro")}
          />
          <ProductCard
            title="ACS"
            value={tier.acs}
            icon={<DollarSign className="h-5 w-5" />}
            color="text-emerald-500"
            checked={selectedProducts.acs}
            onToggle={() => toggleProduct("acs")}
          />
          <ProductCard
            title="Hola! Suite"
            value={tier.holaBasic}
            icon={<DollarSign className="h-5 w-5" />}
            color="text-amber-500"
            checked={selectedProducts.holaBasic}
            onToggle={() => toggleProduct("holaBasic")}
          />
          <Card className="border-2 border-primary bg-primary/5">
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2 text-primary">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">Total Ecosistema</span>
              </div>
              <p className="text-3xl font-bold text-primary">{fmt(grandTotal)}</p>
              <p className="text-xs text-muted-foreground mt-1">/ mes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personalización Hola */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personaliza tu ¡Hola! Suite</CardTitle>
              <p className="text-sm text-muted-foreground">
                HOLA BASIC: 1 WhatsApp oficial + hospedaje en META
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm font-medium text-muted-foreground border-b border-border pb-2">
                <span>Servicio</span>
                <div className="flex gap-8">
                  <span>Cant.</span>
                  <span>P/U</span>
                  <span className="w-20 text-right">Subtotal</span>
                </div>
              </div>

              {/* Licencia base */}
              <div className="flex justify-between items-center text-sm py-1">
                <span className="font-medium text-foreground">Licencia base</span>
                <span className="font-semibold text-foreground w-20 text-right">{fmt(tier.holaBasic)}</span>
              </div>

              {addons.map((addon) => {
                const qty = addonQty[addon.name] || 0;
                const subtotal = qty * addon.unitPrice;
                return (
                  <div key={addon.name} className="flex justify-between items-center text-sm py-1">
                    <span className="text-foreground">
                      {addon.name}
                    </span>
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
                <span className="font-semibold text-foreground">Subtotal Hola</span>
                <span className="text-xl font-bold text-primary">{fmt(licenseBase + addonTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Hola Cloud selectable */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Hola Cloud
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Seleccioná un plan para sumarlo al ecosistema
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {holaCloudPlans.map((plan) => {
                const isSelected = selectedCloud === plan.name;
                return (
                  <button
                    key={plan.name}
                    onClick={() => setSelectedCloud(isSelected ? null : plan.name)}
                    className={`w-full flex justify-between items-center rounded-lg border px-4 py-3 transition-colors text-left ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span className={`font-medium ${isSelected ? "text-foreground" : "text-foreground"}`}>
                        {plan.name}
                      </span>
                    </div>
                    <span className="font-bold text-foreground">{fmt(plan.price)}</span>
                  </button>
                );
              })}
              {selectedCloud && (
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="font-semibold text-foreground">Cloud seleccionado</span>
                  <span className="text-xl font-bold text-primary">{fmt(cloudPrice)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl">Resumen de Cotización</CardTitle>
            <p className="text-sm text-muted-foreground">
              Detalle completo para {fmtClients(clientCount)} clientes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Ecosistema
              </h3>
              <SummaryLine
                label="Wispro"
                value={tier.wispro}
                active={selectedProducts.wispro}
              />
              <SummaryLine
                label="ACS"
                value={tier.acs}
                active={selectedProducts.acs}
              />
              <SummaryLine
                label="Hola! Suite"
                value={tier.holaBasic}
                active={selectedProducts.holaBasic}
              />
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Personalización Hola
              </h3>
              <SummaryLine label="Licencia base" value={licenseBase} active />
              {addons.map((addon) => {
                const qty = addonQty[addon.name] || 0;
                if (qty === 0) return null;
                const subtotal = qty * addon.unitPrice;
                return (
                  <SummaryLine
                    key={addon.name}
                    label={`${addon.name} (x${qty})`}
                    value={subtotal}
                    active
                  />
                );
              })}
            </div>

            {selectedCloud && (
              <div className="border-t border-border pt-3 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Cloud
                </h3>
                <SummaryLine label={selectedCloud} value={cloudPrice} active />
              </div>
            )}

            <div className="border-t-2 border-primary/30 pt-4 space-y-3">
              {/* Discount selector */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Descuento</span>
                <Select
                  value={String(discount)}
                  onValueChange={(v) => setDiscount(Number(v))}
                >
                  <SelectTrigger className="w-32 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 5, 10, 15, 20, 25, 30].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d === 0 ? "Sin descuento" : `${d}%`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold text-foreground">Total Mensual</p>
                  <p className="text-xs text-muted-foreground">Ecosistema + Personalización + Cloud</p>
                </div>
                <div className="text-right">
                  {discount > 0 ? (
                    <>
                      <p className="text-lg text-muted-foreground line-through">{fmt(grandTotal)}</p>
                      <p className="text-4xl font-bold text-primary">{fmt(discountedTotal)}</p>
                      <p className="text-sm text-emerald-600 font-medium">Ahorro: {fmt(discountAmount)}</p>
                    </>
                  ) : (
                    <p className="text-4xl font-bold text-primary">{fmt(grandTotal)}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Instalación (único pago)</p>
              <p className="text-lg font-bold text-foreground">{fmt(100)}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

function ProductCard({
  title,
  value,
  icon,
  color,
  checked,
  onToggle,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        checked ? "" : "opacity-40"
      }`}
      onClick={onToggle}
    >
      <CardContent className="pt-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Checkbox checked={checked} className="pointer-events-none" />
        </div>
        <div className={`flex items-center justify-center gap-2 mb-2 ${color}`}>
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <p className="text-3xl font-bold text-foreground">{fmt(value)}</p>
        <p className="text-xs text-muted-foreground mt-1">/ mes</p>
      </CardContent>
    </Card>
  );
}

function SummaryLine({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center text-sm py-1 ${
        active ? "text-foreground" : "text-muted-foreground line-through opacity-50"
      }`}
    >
      <span>{label}</span>
      <span className="font-semibold">{fmt(active ? value : 0)}</span>
    </div>
  );
}

export default Index;
