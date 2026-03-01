import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AppMenu from "@/components/AppMenu";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface QuoteRow {
  id: string;
  client_name: string;
  client_company: string;
  clients_count: number;
  total: number;
  discounted_total: number;
  discount: number;
  items: any[];
  seller_name: string;
  created_at: string;
}

const Cotizaciones = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("quotes" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setQuotes((data as any) || []);
        setLoading(false);
      });
  }, [user]);

  const getPlatforms = (items: any[]) => {
    const sections = new Set((items || []).map((i: any) => {
      if (i.section === "eco") return i.label;
      if (i.section === "cloud") return "Cloud";
      return null;
    }).filter(Boolean));
    return Array.from(sections).join(", ");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Historial de Cotizaciones</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : quotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay cotizaciones enviadas aún.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {quotes.map((q) => {
              const finalTotal = q.discount > 0 ? q.discounted_total : q.total;
              return (
                <Card key={q.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <p className="text-sm text-muted-foreground">{formatDate(q.created_at)}</p>
                      <p className="font-medium text-foreground">
                        {q.client_name || q.client_company || "Sin destinatario"}
                        {q.client_company && q.client_name ? ` — ${q.client_company}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {q.clients_count.toLocaleString("es-AR")} clientes · {getPlatforms(q.items)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-primary">{fmt(finalTotal)}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => window.open(`/cotizacion?id=${q.id}`, "_blank")}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Cotizaciones;
