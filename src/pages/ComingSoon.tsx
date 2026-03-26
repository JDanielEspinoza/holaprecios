import AppBanner from "@/components/AppBanner";
import AppMenu from "@/components/AppMenu";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

const ComingSoon = () => (
  <div className="min-h-screen bg-premium-gradient">
    <AppBanner />
    <div className="absolute top-4 left-4 z-10">
      <AppMenu />
    </div>
    <main className="mx-auto max-w-lg px-6 py-20">
      <Card className="card-premium">
        <CardContent className="py-16 text-center space-y-4">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Próximamente</h2>
          <p className="text-muted-foreground text-sm">
            Este módulo estará disponible muy pronto.
          </p>
        </CardContent>
      </Card>
    </main>
  </div>
);

export default ComingSoon;
