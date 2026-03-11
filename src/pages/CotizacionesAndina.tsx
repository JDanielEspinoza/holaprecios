import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Loader2, ExternalLink, Building2, Search, Filter, CheckCircle2, CircleDot,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppMenu from "@/components/AppMenu";
import AppBanner from "@/components/AppBanner";

const PUBLISHED_DOMAIN = "https://holaprecios.lovable.app";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface QuoteRow {
  id: string;
  quote_number: number;
  client_name: string | null;
  client_company: string | null;
  client_email: string | null;
  client_phone: string | null;
  clients_count: number;
  total: number;
  discounted_total: number;
  discount_amount: number;
  items: any[];
  seller_name: string | null;
  created_at: string;
  archived: boolean;
  entry_payment_paid: boolean;
}

const CotizacionesAndina = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");

  const fetchQuotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("quotes")
      .select("*")
      .eq("archived", false)
      .order("quote_number", { ascending: false });
    setQuotes((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuotes(); }, [user]);

  const agents = useMemo(() => {
    const set = new Set(quotes.map((q) => q.seller_name).filter(Boolean));
    return Array.from(set) as string[];
  }, [quotes]);

  const filtered = useMemo(() => {
    let list = quotes;
    if (agentFilter !== "all") {
      list = list.filter((q) => q.seller_name === agentFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((q) =>
        (q.client_name || "").toLowerCase().includes(s) ||
        (q.client_company || "").toLowerCase().includes(s) ||
        (q.client_email || "").toLowerCase().includes(s) ||
        (q.client_phone || "").toLowerCase().includes(s) ||
        String(q.quote_number).includes(s)
      );
    }
    return list;
  }, [quotes, search, agentFilter]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getPlatforms = (items: any[]) => {
    const sections = new Set(
      (items || [])
        .map((i: any) => {
          if (i.section === "eco") return i.label;
          if (i.section === "cloud") return null;
          return null;
        })
        .filter(Boolean)
    );
    return Array.from(sections).join(", ");
  };

  return (
    <div className="min-h-screen bg-premium-gradient">
      <AppBanner />
      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-6 animate-fade-slide-up">
          <Building2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Cotizaciones Andina Link</h1>
          <Badge variant="secondary" className="ml-2">{filtered.length} cotizaciones</Badge>
        </div>

        {/* Filters */}
        <Card className="card-premium mb-6 animate-fade-slide-up-1">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, empresa, email, teléfono o N°..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 input-premium"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Agente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los agentes</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="card-premium">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay cotizaciones que coincidan.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-premium animate-fade-slide-up-2 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[50px] md:w-[70px]">N°</TableHead>
                    <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden lg:table-cell">Empresa</TableHead>
                    <TableHead className="hidden xl:table-cell">Contacto</TableHead>
                    <TableHead className="hidden xl:table-cell">Productos</TableHead>
                    <TableHead className="hidden md:table-cell">Agente</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Pago</TableHead>
                    <TableHead className="text-right">Ver</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((q) => {
                    const finalTotal = q.discount_amount > 0 ? q.discounted_total : q.total;
                    return (
                      <TableRow
                        key={q.id}
                        className={`transition-colors ${
                          q.entry_payment_paid
                            ? "bg-emerald-50 dark:bg-emerald-950/20"
                            : ""
                        }`}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{q.quote_number}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm whitespace-nowrap">
                          {formatDate(q.created_at)}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          <div>{q.client_name || "—"}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">{formatDate(q.created_at)}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {q.client_company || "—"}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                          <div>{q.client_email || ""}</div>
                          <div>{q.client_phone || ""}</div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell text-xs">
                          {getPlatforms(q.items)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {q.seller_name || "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                          {fmt(finalTotal)}
                        </TableCell>
                        <TableCell className="text-center">
                          {q.entry_payment_paid ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto" />
                          ) : (
                            <CircleDot className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(`${PUBLISHED_DOMAIN}/cotizacion?id=${q.id}`, "_blank")}
                            title="Ver cotización"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CotizacionesAndina;
