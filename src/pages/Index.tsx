import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingTiers, addons, holaCloudPlans, getMinCloudPlanIndex } from "@/data/pricing";
import { Users, Cloud, Plus, Minus, Check, RotateCcw, Settings2, Loader2, CheckCircle, ArrowLeft, User, Building, Phone, Mail } from "lucide-react";
import { QuoteShare } from "@/components/QuoteShare";
import bannerWI from "@/assets/banner_w_i-2.jpg";
import logoWispro from "@/assets/logo-wispro.png";
import logoAcs from "@/assets/logo-acs.png";
import logoHola from "@/assets/logo-hola.png";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppMenu from "@/components/AppMenu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PUBLISHED_DOMAIN = "https://holaprecios.lovable.app";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtClients = (n: number) => n.toLocaleString("es-AR");

// Auto-discount per product
const PRODUCT_DISCOUNTS: Record<string, number> = {
  wispro: 20,
  acs: 5,
  holaBasic: 5,
};

type ViewState = "form" | "loading" | "success";

const Index = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [view, setView] = useState<ViewState>("form");
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState({
    wispro: false,
    acs: false,
    holaBasic: false,
  });
  const [addonQty, setAddonQty] = useState<Record<string, number>>(
    Object.fromEntries(addons.map((a) => [a.name, 0]))
  );
  const [selectedCloud, setSelectedCloud] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const tier = useMemo(
    () => (clientCount ? pricingTiers.find((t) => t.clients === clientCount) || pricingTiers[0] : null),
    [clientCount]
  );

  // Implementation: $200 per app → $50 per app (75% feria discount)
  const selectedProductCount = [selectedProducts.wispro, selectedProducts.acs, selectedProducts.holaBasic].filter(Boolean).length;
  const implementationOriginal = selectedProductCount * 200;
  const implementationCost = selectedProductCount * 50;
  const installationCost = implementationCost;

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

  const grandTotal = ecosystemTotal + addonTotal + cloudPrice;

  // Auto-discount calculation per product
  const discountAmount = useMemo(() => {
    if (!tier) return 0;
    let amount = 0;
    if (selectedProducts.wispro) amount += tier.wispro * (PRODUCT_DISCOUNTS.wispro / 100);
    if (selectedProducts.acs) amount += tier.acs * (PRODUCT_DISCOUNTS.acs / 100);
    if (selectedProducts.holaBasic) amount += tier.holaBasic * (PRODUCT_DISCOUNTS.holaBasic / 100);
    return amount;
  }, [tier, selectedProducts]);

  const discountedTotal = grandTotal - discountAmount;
  const blendedDiscount = grandTotal > 0 ? Math.round((discountAmount / grandTotal) * 100) : 0;

  const toggleProduct = (key: keyof typeof selectedProducts) => {
    setSelectedProducts((p) => ({ ...p, [key]: !p[key] }));
  };

  const resetAll = () => {
    setClientCount(null);
    setSelectedProducts({ wispro: false, acs: false, holaBasic: false });
    setAddonQty(Object.fromEntries(addons.map((a) => [a.name, 0])));
    setSelectedCloud(null);
    setClientName("");
    setClientCompany("");
    setClientPhone("");
    setClientEmail("");
    setQuoteId(null);
  };

  const buildItems = () => {
    const items: { label: string; value: number; section: string; discount_pct?: number }[] = [];
    if (tier && selectedProducts.wispro)
      items.push({ label: "Wispro", value: tier.wispro, section: "eco", discount_pct: PRODUCT_DISCOUNTS.wispro });
    if (tier && selectedProducts.acs)
      items.push({ label: "ACS", value: tier.acs, section: "eco", discount_pct: PRODUCT_DISCOUNTS.acs });
    if (tier && selectedProducts.holaBasic)
      items.push({ label: "Hola! Suite", value: tier.holaBasic, section: "eco", discount_pct: PRODUCT_DISCOUNTS.holaBasic });
    addons.forEach((a) => {
      const qty = addonQty[a.name] || 0;
      if (qty > 0) items.push({ label: `${a.name} (x${qty})`, value: qty * a.unitPrice, section: "hola" });
    });
    if (selectedCloud) items.push({ label: selectedCloud, value: cloudPrice, section: "cloud" });
    return items;
  };

  const handleGenerateQuote = async () => {
    if (!user) return;
    setSaving(true);
    setView("loading");
    try {
      const items = buildItems();
      const { data, error } = await supabase.from("quotes" as any).insert({
        user_id: user.id,
        client_name: clientName,
        client_company: clientCompany,
        client_phone: clientPhone,
        client_email: clientEmail,
        clients_count: clientCount || 0,
        items: items as any,
        discount: blendedDiscount,
        total: grandTotal,
        discounted_total: discountedTotal,
        discount_amount: discountAmount,
        installation_cost: installationCost,
        seller_name: profile?.nombre || "",
        seller_cargo: profile?.cargo || "",
        seller_numero: profile?.numero || "",
        seller_email: profile?.email_contacto || "",
        seller_foto: profile?.foto_url || null,
      } as any).select("id").single();

      if (error) throw error;
      setQuoteId((data as any).id);
      // Wait 2.5s to show loading animation
      await new Promise((r) => setTimeout(r, 2500));
      setView("success");
      toast({ title: "Cotización generada", description: "El QR está listo para compartir." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setView("form");
    } finally {
      setSaving(false);
    }
  };

  const handleNewQuote = () => {
    resetAll();
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quoteUrl = quoteId ? `${PUBLISHED_DOMAIN}/cotizacion?id=${quoteId}` : "";

  // Loading screen
  if (view === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-6 animate-fade-slide-up">
          <Loader2 className="h-16 w-16 animate-spin text-orange-500 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-700">Generando cotización...</h2>
            <p className="text-gray-500">Esto tardará solo unos segundos</p>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
  if (view === "success" && quoteId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full overflow-hidden">
          <img src={bannerWI} alt="Gestión completa de tu proveedor de internet — Wispro + IXC Soft" className="w-full h-20 object-cover object-center" />
        </header>
        <div className="absolute top-4 left-4 z-10">
          <AppMenu />
        </div>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-lg mx-auto w-full">
          <div className="w-full space-y-6 animate-fade-slide-up">
            {/* Success header */}
            <div className="text-center space-y-2">
              <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-700">¡Cotización generada!</h2>
              <p className="text-gray-500 text-sm">Compartila con tu cliente por WhatsApp o escaneando el QR</p>
            </div>

            {/* Client data summary */}
            {(clientName || clientCompany || clientPhone || clientEmail) && (
              <Card className="border border-gray-200 bg-white">
                <CardContent className="pt-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Destinatario</p>
                  {clientName && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="h-3.5 w-3.5 text-gray-400" /><span>{clientName}</span>
                    </div>
                  )}
                  {clientCompany && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Building className="h-3.5 w-3.5" /><span>{clientCompany}</span>
                    </div>
                  )}
                  {clientPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-3.5 w-3.5" /><span>{clientPhone}</span>
                    </div>
                  )}
                  {clientEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-3.5 w-3.5" /><span>{clientEmail}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Share component */}
            <QuoteShare quoteUrl={quoteUrl} clientPhone={clientPhone} agentName={profile?.nombre} />

            {/* Back button */}
            <Button
              onClick={handleNewQuote}
              variant="outline"
              className="w-full gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
              size="lg"
            >
              <ArrowLeft className="h-5 w-5" />
              Crear otra cotización
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Form view (default)
  return (
    <div className="min-h-screen bg-premium-gradient">
      <header className="w-full overflow-hidden">
        <img src={bannerWI} alt="Gestión completa de tu proveedor de internet — Wispro + IXC Soft" className="w-full h-20 object-cover object-center" />
      </header>

      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Client selector */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 card-premium animate-fade-slide-up">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cantidad de clientes</p>
                  <p className="text-xs text-muted-foreground">Seleccioná el rango para calcular</p>
                </div>
              </div>
              <div className="flex-1 w-full md:w-auto">
                <Select value={clientCount?.toString() || ""} onValueChange={(v) => {
                  const count = Number(v);
                  setClientCount(count);
                  setQuoteId(null);
                  const minIdx = getMinCloudPlanIndex(count);
                  setSelectedCloud(holaCloudPlans[minIdx].name);
                }}>
                  <SelectTrigger className="h-12 text-lg font-semibold">
                    <SelectValue placeholder="Seleccioná..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingTiers.map((t) => (
                      <SelectItem key={t.clients} value={t.clients.toString()}>
                        {fmtClients(t.clients)} clientes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={resetAll} title="Reiniciar todo">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {tier && (
          <>
            {/* Ecosystem cards + Hola + Cloud - keep existing form content */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 animate-fade-slide-up-1">
              <ProductCard title="Wispro" value={tier.wispro} logo={logoWispro} checked={selectedProducts.wispro} onToggle={() => { setSelectedProducts((p) => ({ ...p, wispro: !p.wispro })); setQuoteId(null); }} discountPct={PRODUCT_DISCOUNTS.wispro} />
              <ProductCard title="ACS" value={tier.acs} logo={logoAcs} checked={selectedProducts.acs} onToggle={() => { setSelectedProducts((p) => ({ ...p, acs: !p.acs })); setQuoteId(null); }} discountPct={PRODUCT_DISCOUNTS.acs} />
              <ProductCard title="Hola! Suite" value={tier.holaBasic} logo={logoHola} checked={selectedProducts.holaBasic} onToggle={() => { setSelectedProducts((p) => ({ ...p, holaBasic: !p.holaBasic })); setQuoteId(null); }} discountPct={PRODUCT_DISCOUNTS.holaBasic} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-slide-up-2">
              {/* Personalización Hola */}
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    Personaliza tu ¡Hola! Suite
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Hola! Suite Basic: 1 WhatsApp Oficial + Hospedaje en Meta + 3 accesos
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

                  <div className="flex justify-between items-center text-sm py-1">
                    <span className="font-medium text-foreground">Licencia base</span>
                    <span className="font-semibold text-foreground w-20 text-right">{fmt(tier?.holaBasic ?? 0)}</span>
                  </div>

                  {addons.map((addon) => {
                    const qty = addonQty[addon.name] || 0;
                    const subtotal = qty * addon.unitPrice;
                    return (
                      <div key={addon.name} className="flex justify-between items-center text-sm py-1">
                        <span className="text-foreground">{addon.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setAddonQty((p) => ({ ...p, [addon.name]: Math.max(0, (p[addon.name] || 0) - 1) }))}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-mono">{qty}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setAddonQty((p) => ({ ...p, [addon.name]: (p[addon.name] || 0) + 1 }))}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-muted-foreground w-14 text-right">{fmt(addon.unitPrice)}</span>
                          <span className="font-semibold w-20 text-right text-foreground">{fmt(subtotal)}</span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="font-semibold text-foreground">Subtotal Hola</span>
                    <span className="text-xl font-bold text-primary">{fmt((selectedProducts.holaBasic && tier ? tier.holaBasic : 0) + addonTotal)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Hola Cloud */}
              <Card className="card-premium flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Hola Cloud
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Plan asignado automáticamente según clientes. Podés upgradearlo.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 flex flex-col flex-1">
                  <div className="space-y-2">
                    {(() => {
                      const minIdx = clientCount ? getMinCloudPlanIndex(clientCount) : 0;
                      return holaCloudPlans.map((plan, idx) => {
                        const isSelected = selectedCloud === plan.name;
                        const isDisabled = idx < minIdx;
                        return (
                          <button
                            key={plan.name}
                            disabled={isDisabled}
                            onClick={() => !isDisabled && setSelectedCloud(plan.name)}
                            className={`w-full flex justify-between items-center rounded-lg border px-4 py-3 transition-colors text-left ${
                              isDisabled
                                ? "opacity-40 cursor-not-allowed border-border bg-gray-50"
                                : isSelected
                                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                                  : "border-border hover:bg-accent/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <span className="font-medium text-foreground">{plan.name}</span>
                              {idx === minIdx && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">Recomendado</span>}
                            </div>
                            <span className="font-bold text-foreground">{fmt(plan.price)}</span>
                          </button>
                        );
                      });
                    })()}
                  </div>
                  <div className="mt-auto pt-2">
                    <div className="border-t border-border pt-3 flex justify-between items-center">
                      <span className="font-semibold text-foreground">Cloud seleccionado</span>
                      <span className="text-xl font-bold text-primary">{fmt(selectedCloud ? cloudPrice : 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Summary */}
        <Card className="border-2 border-primary/30 bg-primary/5 card-premium animate-fade-slide-up-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Resumen</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {clientCount ? `Para ${fmtClients(clientCount)} clientes` : "Seleccioná la cantidad de clientes"}
                </p>
              </div>
              {clientCount && (
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{fmt(discountedTotal)}</p>
                  <p className="text-xs text-muted-foreground">/ mes</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <SummaryLine label="Wispro" value={tier?.wispro ?? 0} active={selectedProducts.wispro} />
              <SummaryLine label="ACS" value={tier?.acs ?? 0} active={selectedProducts.acs} />
              <SummaryLine label="Hola! Suite" value={tier?.holaBasic ?? 0} active={selectedProducts.holaBasic} />
              {addons.map((a) => {
                const qty = addonQty[a.name] || 0;
                return <SummaryLine key={a.name} label={`${a.name} (x${qty})`} value={qty * a.unitPrice} active={qty > 0} />;
              })}
              <SummaryLine label={selectedCloud || "Cloud"} value={cloudPrice} active={!!selectedCloud} />
            </div>

            {/* Implementation */}
            <div className="border-t border-border pt-3 flex justify-between items-center text-sm">
              <div>
                <span className="text-muted-foreground">Pago de Implementación (único pago)</span>
                {selectedProductCount > 0 && (
                  <span className="block text-xs text-emerald-600">
                    {selectedProductCount} {selectedProductCount === 1 ? "aplicación" : "aplicaciones"} × $50 (75% dto. feria)
                  </span>
                )}
              </div>
              <div className="text-right">
                {implementationOriginal > 0 && (
                  <span className="text-muted-foreground line-through text-xs mr-2">{fmt(implementationOriginal)}</span>
                )}
                <span className="font-bold">{fmt(implementationCost)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client fields */}
        <Card className="card-premium animate-fade-slide-up-4">
          <CardHeader>
            <CardTitle className="text-lg">Datos del destinatario (opcional)</CardTitle>
            <p className="text-sm text-muted-foreground">Completá los datos del cliente para personalizar la cotización</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nombre</Label>
                <Input id="clientName" placeholder="Nombre del cliente" value={clientName} onChange={(e) => { setClientName(e.target.value); setQuoteId(null); }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCompany">Empresa</Label>
                <Input id="clientCompany" placeholder="Nombre de la empresa" value={clientCompany} onChange={(e) => { setClientCompany(e.target.value); setQuoteId(null); }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Teléfono</Label>
                <Input id="clientPhone" placeholder="Teléfono de contacto" value={clientPhone} onChange={(e) => { setClientPhone(e.target.value); setQuoteId(null); }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input id="clientEmail" placeholder="Email de contacto" type="email" value={clientEmail} onChange={(e) => { setClientEmail(e.target.value); setQuoteId(null); }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate */}
        <Button onClick={handleGenerateQuote} disabled={saving || !clientCount} className="w-full h-14 text-lg btn-premium" size="lg">
          Generar Cotización
        </Button>
      </main>
    </div>
  );
};

function ProductCard({ title, value, logo, checked, onToggle, discountPct }: { title: string; value: number; logo: string; checked: boolean; onToggle: () => void; discountPct: number }) {
  return (
    <Card className={`cursor-pointer card-premium transition-all ${checked ? "ring-2 ring-orange-500 border-orange-500" : ""}`} onClick={onToggle}>
      <CardContent className="pt-3 md:pt-5 text-center">
        <div className="flex items-center justify-center mb-1.5 md:mb-2">
          <Checkbox checked={checked} className={`pointer-events-none h-4 w-4 md:h-5 md:w-5 ${checked ? "border-orange-500 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800" : ""}`} />
        </div>
        <div className="flex items-center justify-center mb-2 md:mb-3">
          <img src={logo} alt={title} className={`h-10 md:h-16 w-auto object-contain ${title === "Hola! Suite" ? "rounded-xl" : ""} ${title === "ACS" ? "border-0 shadow-none" : ""}`} style={title === "ACS" ? { border: "none", outline: "none" } : undefined} />
        </div>
        <p className="text-lg md:text-2xl font-bold text-foreground">{fmt(value)}</p>
        <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">/ mes</p>
      </CardContent>
    </Card>
  );
}

function SummaryLine({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <div className={`flex justify-between items-center text-sm py-1 ${active ? "text-foreground" : "text-muted-foreground line-through opacity-50"}`}>
      <span>{label}</span>
      <span className="font-semibold">{fmt(active ? value : 0)}</span>
    </div>
  );
}

export default Index;
