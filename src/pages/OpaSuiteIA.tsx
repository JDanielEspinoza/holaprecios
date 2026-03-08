import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Mic, AudioLines } from "lucide-react";
import AppMenu from "@/components/AppMenu";
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
    icon: geminiIcon,
    rates: { text: 0.26, vozPadrao: 0.34, vozClonada: 0.56 },
  },
  {
    name: "OpenAI",
    color: "text-gray-300",
    bgGlow: "from-gray-400/10 to-transparent",
    icon: openaiIcon,
    rates: { text: 0.36, vozPadrao: 0.44, vozClonada: 0.66 },
  },
  {
    name: "Claude",
    color: "text-orange-400",
    bgGlow: "from-orange-500/10 to-transparent",
    icon: claudeIcon,
    rates: { text: 0.51, vozPadrao: 0.59, vozClonada: 0.81 },
  },
];

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const OpaSuiteIA = () => {
  const [atendimentos, setAtendimentos] = useState(600);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>

      {/* Banner */}
      <div className="w-full max-w-5xl mx-auto px-4 pt-16">
        <div className="rounded-2xl overflow-hidden">
          <img src={opaBanner} alt="Opa! Suite" className="w-full h-auto object-cover" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mt-10 mb-8 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Compare os custos por IA
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Ajuste a quantidade de atendimentos e veja como os valores mudam em tempo real.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-md mx-auto mb-12 px-4">
        <div className="bg-[#1a1d27] border border-gray-700/50 rounded-2xl p-6 flex items-center justify-between gap-4">
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
      </div>

      {/* Cards + Mockup */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            {providers.map((p) => {
              const textTotal = p.rates.text * atendimentos;
              const vozTotal = p.rates.vozPadrao * atendimentos;
              const clonTotal = p.rates.vozClonada * atendimentos;
              const lowestCost = textTotal;

              return (
                <Card
                  key={p.name}
                  className="bg-[#1a1d27] border-gray-700/50 rounded-2xl overflow-hidden relative"
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
                        <p className="text-lg font-bold text-white">{fmtBRL(textTotal)}</p>
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-400">Voz Padrão</p>
                            <p className="text-xs text-gray-500">R$ {p.rates.vozPadrao.toFixed(2)} / atend.</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-white">{fmtBRL(vozTotal)}</p>
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <AudioLines className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-400">Voz Clonada</p>
                            <p className="text-xs text-gray-500">R$ {p.rates.vozClonada.toFixed(2)} / atend.</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-white">{fmtBRL(clonTotal)}</p>
                      </div>
                    </div>

                    <div className="mt-6 bg-gray-800/50 rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Custo mais baixo</p>
                      <p className={`text-2xl font-bold ${p.color}`}>
                        {fmtBRL(lowestCost)}
                        <span className="text-sm font-normal text-gray-500">/mês</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Phone Mockup */}
          <div className="hidden lg:flex items-center justify-center lg:w-72 xl:w-80 flex-shrink-0">
            <img
              src={mobileOpa}
              alt="Opa! Suite em ação"
              className="w-full h-auto object-contain max-h-[600px] drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 pb-10">
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
    </div>
  );
};

export default OpaSuiteIA;
