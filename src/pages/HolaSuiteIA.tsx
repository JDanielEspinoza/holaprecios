import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Mic, AudioLines } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import AppMenu from "@/components/AppMenu";
import holaBanner from "@/assets/holabanner.jpg";
import metaPartners from "@/assets/meta-partners.png";
import geminiIcon from "@/assets/gemini-icon.png";
import openaiIcon from "@/assets/openai-icon.png";
import claudeIcon from "@/assets/claude-icon.png";
import googlePlayBadge from "@/assets/google-play-badge.svg";
import appStoreBadge from "@/assets/app-store-badge.svg";

type CountryCode = "AR" | "CO" | "MX" | "PE" | "LATAM";

const countries: { code: CountryCode; label: string }[] = [
  { code: "AR", label: "Argentina" },
  { code: "CO", label: "Colombia" },
  { code: "MX", label: "México" },
  { code: "PE", label: "Perú" },
  { code: "LATAM", label: "Resto de LATAM" },
];

// Country multipliers derived from Meta WhatsApp API costs
// Base = México (1.0), others scaled relative to MX marketing cost
const countryMultipliers: Record<CountryCode, number> = {
  AR: 2.03,   // 0.0618 / 0.0305
  CO: 0.41,   // 0.0125 / 0.0305
  MX: 1.0,    // baseline
  PE: 2.30,   // 0.0703 / 0.0305
  LATAM: 2.43, // 0.0740 / 0.0305
};

const providers = [
  {
    name: "Gemini",
    color: "text-blue-400",
    bgGlow: "from-blue-500/10 to-transparent",
    glowClass: "glow-gemini",
    icon: geminiIcon,
    baseRates: { text: 0.048, voz: 0.062, clonada: 0.102 },
  },
  {
    name: "OpenAI",
    color: "text-gray-300",
    bgGlow: "from-gray-400/10 to-transparent",
    glowClass: "glow-openai",
    icon: openaiIcon,
    baseRates: { text: 0.065, voz: 0.080, clonada: 0.120 },
  },
  {
    name: "Claude",
    color: "text-orange-400",
    bgGlow: "from-orange-500/10 to-transparent",
    glowClass: "glow-claude",
    icon: claudeIcon,
    baseRates: { text: 0.093, voz: 0.107, clonada: 0.147 },
  },
];

const fmtUSD = (n: number) =>
  "$ " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function AnimatedValue({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => fmtUSD(v));
  const [text, setText] = useState(fmtUSD(value));

  useEffect(() => { spring.set(value); }, [value, spring]);
  useEffect(() => {
    const unsub = display.on("change", (v) => setText(v));
    return unsub;
  }, [display]);

  return (
    <motion.span className={className} key={value} initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
      {text}
    </motion.span>
  );
}

const HolaSuiteIA = () => {
  const [atendimientos, setAtendimientos] = useState(600);
  const [country, setCountry] = useState<CountryCode>("MX");
  const multiplier = countryMultipliers[country];

  return (
    <div className="min-h-screen bg-[#0f1117] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-hola" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-hola)" className="text-gray-400" />
          <line x1="10%" y1="20%" x2="40%" y2="50%" stroke="currentColor" strokeWidth="0.3" className="text-blue-400" />
          <line x1="60%" y1="10%" x2="90%" y2="40%" stroke="currentColor" strokeWidth="0.3" className="text-orange-400" />
          <line x1="30%" y1="60%" x2="70%" y2="90%" stroke="currentColor" strokeWidth="0.3" className="text-gray-400" />
        </svg>
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>

      {/* Banner */}
      <motion.div
        className="w-full max-w-5xl mx-auto px-4 pt-16 relative z-[1]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          <img src={holaBanner} alt="Hola! Suite" className="w-full h-auto object-cover" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        className="text-center mt-10 mb-8 px-4 relative z-[1]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Compara los costos por IA
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Ajusta la cantidad de atendimientos y el país para ver cómo varían los valores en tiempo real.
        </p>
      </motion.div>

      {/* Input + Country selector */}
      <motion.div
        className="max-w-xl mx-auto mb-12 px-4 relative z-[1]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <div className="glass-card glow-primary rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Atendimientos / mes
            </span>
            <Input
              type="number"
              min={1}
              value={atendimientos}
              onChange={(e) => setAtendimientos(Math.max(1, parseInt(e.target.value) || 1))}
              className="bg-transparent border-none text-center text-3xl font-bold text-white w-32 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Select value={country} onValueChange={(v) => setCountry(v as CountryCode)}>
            <SelectTrigger className="w-full sm:w-48 bg-gray-800/60 border-gray-700 text-white">
              <SelectValue placeholder="País" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code} className="text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-12 relative z-[1]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((p, index) => {
            const textRate = +(p.baseRates.text * multiplier).toFixed(4);
            const vozRate = +(p.baseRates.voz * multiplier).toFixed(4);
            const clonRate = +(p.baseRates.clonada * multiplier).toFixed(4);
            const textTotal = textRate * atendimientos;
            const vozTotal = vozRate * atendimientos;
            const clonTotal = clonRate * atendimientos;
            const lowestCost = textTotal;

            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: "easeOut" }}
              >
                <Card className={`glass-card ${p.glowClass} border-gray-700/50 rounded-2xl overflow-hidden relative group transition-transform duration-300 hover:scale-[1.02]`}>
                  <div className={`absolute inset-0 bg-gradient-to-b ${p.bgGlow} pointer-events-none`} />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <img src={p.icon} alt={`${p.name} logo`} className="h-10 w-10 rounded-full object-contain" />
                      <h3 className={`text-xl font-bold ${p.color}`}>{p.name}</h3>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-400">Interacción por Texto</p>
                            <p className="text-xs text-gray-500">$ {textRate.toFixed(4)} / atend.</p>
                          </div>
                        </div>
                        <AnimatedValue value={textTotal} className="text-lg font-bold text-white" />
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-400">Voz Estándar</p>
                            <p className="text-xs text-gray-500">$ {vozRate.toFixed(4)} / atend.</p>
                          </div>
                        </div>
                        <AnimatedValue value={vozTotal} className="text-lg font-bold text-white" />
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <AudioLines className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-400">Voz Clonada</p>
                            <p className="text-xs text-gray-500">$ {clonRate.toFixed(4)} / atend.</p>
                          </div>
                        </div>
                        <AnimatedValue value={clonTotal} className="text-lg font-bold text-white" />
                      </div>
                    </div>

                    <div className="mt-6 bg-gray-800/50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Costo más bajo</p>
                      <p className={`text-2xl font-bold ${p.color}`}>
                        <AnimatedValue value={lowestCost} className={p.color} />
                        <span className="text-sm font-normal text-gray-500"> USD/mes</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 pb-10 relative z-[1]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-800">
          <img src={metaPartners} alt="Meta Business Partners" className="h-8 md:h-10 w-auto object-contain brightness-0 invert" />
          <div className="flex items-center gap-3">
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
              <img src={googlePlayBadge} alt="Google Play" className="h-10 w-auto" />
            </a>
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer">
              <img src={appStoreBadge} alt="App Store" className="h-10 w-auto" />
            </a>
          </div>
        </div>
      </footer>

      {/* Gradient bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 z-50" />
    </div>
  );
};

export default HolaSuiteIA;
