import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingTiers, addons, holaCloudPlans } from "@/data/pricing";
import { Users, Cloud, Plus, Minus, Check, RotateCcw } from "lucide-react";
import { QuoteShare } from "@/components/QuoteShare";
import holaBanner from "@/assets/holabanner.jpg";
import logoWispro from "@/assets/logo-wispro.png";
import logoAcs from "@/assets/logo-acs.png";
import logoHola from "@/assets/logo-hola.png";
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
  "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtClients = (n: number) => n.toLocaleString("es-AR");

const Index = () => {
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState({
    wispro: false,
    acs: false,
    holaBasic: false,
  });
  const [discount, setDiscount] = useState(0);
  const [addonQty, setAddonQty] = useState<Record<string, number>>(
    Object.fromEntries(addons.map((a) => [a.name, 0]))
  );
  const [selectedCloud, setSelectedCloud] = useState<string | null>(null);

  const tier = useMemo(
    () => (clientCount ? pricingTiers.find((t) => t.clients === clientCount) || pricingTiers[0] : null),
    [clientCount]
  );

  const installationCost = useMemo(() => {
    let count = 0;
    if (selectedProducts.wispro) count++;
    if (selectedProducts.acs) count++;
    if (selectedProducts.holaBasic) count++;
    return count * 50;
  }, [selectedProducts]);

  const ecosystemTotal = useMemo(() => {
    if (!tier) return 0;
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

  const licenseBase = selectedProducts.holaBasic && tier ? tier.holaBasic : 0;
  const grandTotal = ecosystemTotal + addonTotal + cloudPrice;
  const discountAmount = grandTotal * (discount / 100);
  const discountedTotal = grandTotal - discountAmount;

  const toggleProduct = (key: keyof typeof selectedProducts) => {
    setSelectedProducts((p) => ({ ...p, [key]: !p[key] }));
  };

  const resetAll = () => {
    setClientCount(null);
    setSelectedProducts({ wispro: false, acs: false, holaBasic: false });
    setAddonQty(Object.fromEntries(addons.map((a) => [a.name, 0])));
    setSelectedCloud(null);
    setDiscount(0);
  };

  const quoteData = useMemo(() => {
    const items: { label: string; value: number; section: string }[] = [];
    if (tier && selectedProducts.wispro) items.push({ label: "Wispro", value: tier.wispro, section: "eco" });
    if (tier && selectedProducts.acs) items.push({ label: "ACS", value: tier.acs, section: "eco" });
    if (tier && selectedProducts.holaBasic) items.push({ label: "Hola! Suite", value: tier.holaBasic, section: "eco" });
    if (tier && selectedProducts.holaBasic) items.push({ label: "Licencia base", value: tier.holaBasic, section: "hola" });
    addons.forEach((a) => {
      const qty = addonQty[a.name] || 0;
      if (qty > 0) items.push({ label: `${a.name} (x${qty})`, value: qty * a.unitPrice, section: "hola" });
    });
    if (selectedCloud) items.push({ label: selectedCloud, value: cloudPrice, section: "cloud" });
    return { clients: clientCount || 0, items, discount, total: grandTotal, discountedTotal, discountAmount, installationCost };
  }, [clientCount, selectedProducts, tier, addonQty, selectedCloud, cloudPrice, discount, grandTotal, discountedTotal, discountAmount]);

  const quoteUrl = useMemo(() => {
    const encoded = btoa(JSON.stringify(quoteData));
    return `${window.location.origin}/cotizacion?d=${encoded}`;
  }, [quoteData]);

  const buildQuoteHtml = () => {
    const finalTotal = discount > 0 ? discountedTotal : grandTotal;
    let rows = "";
    if (tier && selectedProducts.wispro) rows += `<tr><td>Wispro</td><td style="text-align:right">${fmt(tier.wispro)}</td></tr>`;
    if (tier && selectedProducts.acs) rows += `<tr><td>ACS</td><td style="text-align:right">${fmt(tier.acs)}</td></tr>`;
    if (tier && selectedProducts.holaBasic) rows += `<tr><td>Hola! Suite</td><td style="text-align:right">${fmt(tier.holaBasic)}</td></tr>`;
    addons.forEach((a) => {
      const qty = addonQty[a.name] || 0;
      if (qty > 0) rows += `<tr><td>${a.name} (x${qty})</td><td style="text-align:right">${fmt(qty * a.unitPrice)}</td></tr>`;
    });
    if (selectedCloud) rows += `<tr><td>${selectedCloud}</td><td style="text-align:right">${fmt(cloudPrice)}</td></tr>`;
    if (discount > 0) rows += `<tr><td>Descuento (${discount}%)</td><td style="text-align:right;color:#16a34a">-${fmt(discountAmount)}</td></tr>`;

    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <h2 style="color:#6d28d9">Cotización Hola Suite</h2>
        <p>Para <strong>${fmtClients(clientCount || 0)} clientes</strong></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="border-bottom:2px solid #e5e7eb"><th style="text-align:left;padding:8px 0">Servicio</th><th style="text-align:right;padding:8px 0">Precio</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="border-top:2px solid #6d28d9;padding-top:12px;text-align:right">
          <span style="font-size:24px;font-weight:bold;color:#6d28d9">${fmt(finalTotal)} / mes</span>
        </div>
        <p style="color:#6b7280;font-size:12px;margin-top:16px">Instalación (único pago): ${fmt(installationCost)}</p>
      </div>
    `;
  };

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
                  value={clientCount ? String(clientCount) : ""}
                  onValueChange={(v) => setClientCount(Number(v))}
                >
                  <SelectTrigger className="text-xl font-bold h-14">
                    <SelectValue placeholder="Seleccionar..." />
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
            value={tier?.wispro ?? 0}
            logo={logoWispro}
            checked={selectedProducts.wispro}
            onToggle={() => toggleProduct("wispro")}
          />
          <ProductCard
            title="ACS"
            value={tier?.acs ?? 0}
            logo={logoAcs}
            checked={selectedProducts.acs}
            onToggle={() => toggleProduct("acs")}
          />
          <ProductCard
            title="Hola! Suite"
            value={tier?.holaBasic ?? 0}
            logo={logoHola}
            checked={selectedProducts.holaBasic}
            onToggle={() => toggleProduct("holaBasic")}
          />
          <Card className="border-2 border-primary bg-primary/5 flex items-center justify-center">
            <CardContent className="pt-6 pb-4 text-center flex flex-col items-center justify-center">
              <span className="text-sm font-medium text-primary mb-2">Total Ecosistema</span>
              <p className="text-3xl font-bold text-primary">{fmt(grandTotal)}</p>
              <p className="text-xs text-muted-foreground mt-1">/ mes</p>
              {(selectedProducts.wispro || selectedProducts.acs || selectedProducts.holaBasic) && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {selectedProducts.wispro && <img src={logoWispro} alt="Wispro" className="h-6 w-auto object-contain" />}
                  {selectedProducts.acs && <img src={logoAcs} alt="ACS" className="h-6 w-auto object-contain" />}
                  {selectedProducts.holaBasic && <img src={logoHola} alt="Hola" className="h-6 w-auto object-contain rounded" />}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personalización Hola */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personaliza tu ¡Hola! Suite</CardTitle>
              <p className="text-sm text-muted-foreground">
                HOLA BASIC: 1 Whatsapp oficial + hospedaje en META + 3 accesos en la plataforma
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
                <span className="font-semibold text-foreground w-20 text-right">{fmt(tier?.holaBasic ?? 0)}</span>
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
              Detalle completo para {fmtClients(clientCount || 0)} clientes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Ecosistema
              </h3>
              <SummaryLine
                label="Wispro"
                value={tier?.wispro ?? 0}
                active={selectedProducts.wispro}
              />
              <SummaryLine
                label="ACS"
                value={tier?.acs ?? 0}
                active={selectedProducts.acs}
              />
              <SummaryLine
                label="Hola! Suite"
                value={tier?.holaBasic ?? 0}
                active={selectedProducts.holaBasic}
              />
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Personalización Hola
              </h3>
              <SummaryLine label="Licencia base" value={licenseBase} active={selectedProducts.holaBasic} />
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
              <p className="text-lg font-bold text-foreground">{fmt(installationCost)}</p>
            </div>
          </CardContent>
        </Card>
        {/* Share */}
        <QuoteShare quoteHtml={buildQuoteHtml()} quoteUrl={quoteUrl} />
      </main>
    </div>
  );
};

function ProductCard({
  title,
  value,
  logo,
  checked,
  onToggle,
}: {
  title: string;
  value: number;
  logo: string;
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
      <CardContent className="pt-5 text-center">
        <div className="flex items-center justify-center mb-2">
          <Checkbox checked={checked} className="pointer-events-none" />
        </div>
        <div className="flex items-center justify-center mb-3">
          <img
            src={logo}
            alt={title}
            className={`h-16 w-auto object-contain ${
              title === "Hola! Suite" ? "rounded-xl" : ""
            } ${title === "ACS" ? "border-0 shadow-none" : ""}`}
            style={title === "ACS" ? { border: "none", outline: "none" } : undefined}
          />
        </div>
        <p className="text-2xl font-bold text-foreground">{fmt(value)}</p>
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
