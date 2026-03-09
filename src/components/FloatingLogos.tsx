import logoIxcAcs from "@/assets/logo-ixc-acs.jpeg";
import logoOlli from "@/assets/logo-olli.png";
import logoOpasuite from "@/assets/logo-opasuite.png";
import logoWispro from "@/assets/logo-wispro-square.png";
import logoHola from "@/assets/logo-hola-2.jpeg";

const logos = [
  { src: logoWispro, alt: "Wispro", size: 72, top: "8%", left: "15%", delay: 0, duration: 6 },
  { src: logoIxcAcs, alt: "IXC ACS", size: 64, top: "5%", left: "65%", delay: 1.2, duration: 7 },
  { src: logoHola, alt: "Hola Suite", size: 68, top: "35%", left: "2%", delay: 0.5, duration: 5.5 },
  { src: logoOpasuite, alt: "Opa Suite", size: 60, top: "55%", left: "75%", delay: 2, duration: 6.5 },
  { src: logoOlli, alt: "Olli", size: 56, top: "70%", left: "12%", delay: 1.5, duration: 7.5 },
];

const FloatingLogos = () => {
  return (
    <>
      <style>{`
        @keyframes orbit1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(12px, -18px) scale(1.05); }
          50% { transform: translate(-8px, -10px) scale(0.97); }
          75% { transform: translate(10px, 8px) scale(1.03); }
        }
        @keyframes orbit2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-15px, 12px) scale(1.06); }
          66% { transform: translate(10px, -14px) scale(0.95); }
        }
        @keyframes orbit3 {
          0%, 100% { transform: translate(0, 0) scale(0.98); }
          50% { transform: translate(18px, -8px) scale(1.04); }
        }
        @keyframes aura-glow {
          0%, 100% { box-shadow: 0 0 20px 6px hsl(var(--primary) / 0.15), 0 0 40px 12px hsl(var(--primary) / 0.08); }
          50% { box-shadow: 0 0 30px 10px hsl(var(--primary) / 0.25), 0 0 60px 20px hsl(var(--primary) / 0.12); }
        }
      `}</style>
      {logos.map((logo, i) => {
        const orbitAnim = `orbit${(i % 3) + 1}`;
        return (
          <div
            key={logo.alt}
            className="absolute z-20 pointer-events-none"
            style={{
              top: logo.top,
              left: logo.left,
              width: logo.size,
              height: logo.size,
              animation: `${orbitAnim} ${logo.duration}s ease-in-out infinite, aura-glow ${logo.duration * 0.8}s ease-in-out infinite`,
              animationDelay: `${logo.delay}s`,
            }}
          >
            <div
              className="w-full h-full rounded-full overflow-hidden bg-background/90 backdrop-blur-sm border-2 border-border/30"
              style={{
                boxShadow: "0 0 20px 4px hsl(var(--primary) / 0.12), 0 4px 12px hsl(0 0% 0% / 0.2)",
              }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default FloatingLogos;
