import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mic, AudioLines } from "lucide-react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import AppMenu from "@/components/AppMenu";
import EventBadge from "@/components/EventBadge";
import opaBanner from "@/assets/opasuite-banner.jpeg";
import metaPartners from "@/assets/meta-partners.png";
import geminiIcon from "@/assets/gemini-icon.png";
import openaiIcon from "@/assets/openai-icon.png";
import claudeIcon from "@/assets/claude-icon.png";
import mobileOpa from "@/assets/mobile-opa-message.png";
import googlePlayBadge from "@/assets/google-play-badge.svg";
import appStoreBadge from "@/assets/app-store-badge.svg";

const providers = [
  {
    name: "Gemini",
    color: "text-blue-400",
    bgGlow: "from-blue-500/10 to-transparent",
    glowClass: "glow-gemini",
    icon: geminiIcon,
    rates: { text: 0.26, vozPadrao: 0.34, vozClonada: 0.56 },
  },
  {
    name: "OpenAI",
    color: "text-gray-300",
    bgGlow: "from-gray-400/10 to-transparent",
    glowClass: "glow-openai",
    icon: openaiIcon,
    rates: { text: 0.36, vozPadrao: 0.44, vozClonada: 0.66 },
  },
  {
    name: "Claude",
    color: "text-orange-400",
    bgGlow: "from-orange-500/10 to-transparent",
    glowClass: "glow-claude",
    icon: claudeIcon,
    rates: { text: 0.51, vozPadrao: 0.59, vozClonada: 0.81 },
  },
];

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* Animated number that rolls between values */
function AnimatedValue({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => fmtBRL(v));
  const [text, setText] = useState(fmtBRL(value));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setText(v));
    return unsub;
  }, [display]);

  return (
    <motion.span
      className={className}
      key={value}
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {text}
    </motion.span>
  );
}

const OpaSuiteIA = () => {
  const [atendimentos, setAtendimentos] = useState(600);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* SVG connected lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-gray-400" />
          <line x1="10%" y1="20%" x2="40%" y2="50%" stroke="currentColor" strokeWidth="0.3" className="text-blue-400" />
          <line x1="60%" y1="10%" x2="90%" y2="40%" stroke="currentColor" strokeWidth="0.3" className="text-orange-400" />
          <line x1="30%" y1="60%" x2="70%" y2="90%" stroke="currentColor" strokeWidth="0.3" className="text-gray-400" />
        </svg>
        {/* Blurred orbs */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>

      {/* Banner with animation */}
      <motion.div
        className="w-full max-w-5xl mx-auto px-4 pt-16 relative z-[1]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          <img src={opaBanner} alt="Opa! Suite" className="w-full h-auto object-cover" />
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
          Compare os custos por IA
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Ajuste a quantidade de atendimentos e veja como os valores mudam em tempo real.
        </p>
      </motion.div>

      {/* Input with glow */}
      <motion.div
        className="max-w-md mx-auto mb-12 px-4 relative z-[1]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <div className="glass-card glow-primary rounded-2xl p-6 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
            Atendimentos / mês
          </span>
          <Input
            type="number"
            min={1}
            value={atendimentos}
            onChange={(e) => setAtendimentos(Math.max(1, parseInt(e.target.value) || 1))}
            className="bg-transparent border-none text-center text-3xl font-bold text-white w-32 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </motion.div>

      {/* Cards + Mockup */}
      <div className="max-w-6xl mx-auto px-4 pb-12 relative z-[1]">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            {providers.map((p, index) => {
              const textTotal = p.rates.text * atendimentos;
              const vozTotal = p.rates.vozPadrao * atendimentos;
              const clonTotal = p.rates.vozClonada * atendimentos;
              const lowestCost = textTotal;

              return (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                >
                  <Card
                    className={`glass-card ${p.glowClass} border-gray-700/50 rounded-2xl overflow-hidden relative group transition-transform duration-300 hover:scale-[1.02]`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-b ${p.bgGlow} pointer-events-none`} />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <img
                          src={p.icon}
                          alt={`${p.name} logo`}
                          className="h-10 w-10 rounded-full object-contain"
                        />
                        <h3 className={`text-xl font-bold ${p.color}`}>{p.name}</h3>
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-400">Interação por Texto</p>
                              <p className="text-xs text-gray-500">R$ {p.rates.text.toFixed(2)} / atend.</p>
                            </div>
                          </div>
                          <AnimatedValue value={textTotal} className="text-lg font-bold text-white" />
                        </div>

                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Mic className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-400">Voz Padrão</p>
                              <p className="text-xs text-gray-500">R$ {p.rates.vozPadrao.toFixed(2)} / atend.</p>
                            </div>
                          </div>
                          <AnimatedValue value={vozTotal} className="text-lg font-bold text-white" />
                        </div>

                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <AudioLines className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-400">Voz Clonada</p>
                              <p className="text-xs text-gray-500">R$ {p.rates.vozClonada.toFixed(2)} / atend.</p>
                            </div>
                          </div>
                          <AnimatedValue value={clonTotal} className="text-lg font-bold text-white" />
                        </div>
                      </div>

                      <div className="mt-6 bg-gray-800/50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Custo mais baixo</p>
                        <p className={`text-2xl font-bold ${p.color}`}>
                          <AnimatedValue value={lowestCost} className={p.color} />
                          <span className="text-sm font-normal text-gray-500">/mês</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Phone Mockup with slide-in */}
          <motion.div
            className="hidden lg:flex items-center justify-center lg:w-72 xl:w-80 flex-shrink-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          >
            <img
              src={mobileOpa}
              alt="Opa! Suite em ação"
              className="w-full h-auto object-contain max-h-[600px] drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 pb-10 relative z-[1]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-800">
          <img
            src={metaPartners}
            alt="Meta Business Partners"
            className="h-8 md:h-10 w-auto object-contain brightness-0 invert"
          />
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

export default OpaSuiteIA;
