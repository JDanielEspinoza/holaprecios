import logoIxcAcs from "@/assets/logo-ixc-acs.jpeg";
import logoOlli from "@/assets/logo-olli.png";
import logoOpasuite from "@/assets/logo-opasuite.png";
import logoWispro from "@/assets/logo-wispro-square.png";
import logoHola from "@/assets/logo-hola-2.jpeg";

const logos = [
  { src: logoWispro, alt: "Wispro", size: 70, top: "12%", left: "30%", delay: 0, duration: 6, bg: "#fff" },
  { src: logoIxcAcs, alt: "IXC ACS", size: 62, top: "8%", left: "58%", delay: 1.2, duration: 7, bg: "#fff" },
  { src: logoHola, alt: "Hola Suite", size: 66, top: "38%", left: "18%", delay: 0.5, duration: 5.5, bg: "#fff" },
  { src: logoOpasuite, alt: "Opa Suite", size: 60, top: "50%", left: "68%", delay: 2, duration: 6.5, bg: "#fff" },
  { src: logoOlli, alt: "Olli", size: 58, top: "68%", left: "25%", delay: 1.5, duration: 7.5, bg: "#fff" },
];

const FloatingLogos = () => {
  return (
    <>
      <style>{`
        @keyframes orbit1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -14px) scale(1.04); }
          50% { transform: translate(-6px, -8px) scale(0.97); }
          75% { transform: translate(8px, 6px) scale(1.02); }
        }
        @keyframes orbit2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-12px, 10px) scale(1.05); }
          66% { transform: translate(8px, -12px) scale(0.96); }
        }
        @keyframes orbit3 {
          0%, 100% { transform: translate(0, 0) scale(0.98); }
          50% { transform: translate(14px, -6px) scale(1.04); }
        }
        @keyframes aura-glow {
          0%, 100% { box-shadow: 0 0 18px 5px hsl(var(--primary) / 0.12), 0 0 36px 10px hsl(var(--primary) / 0.06); }
          50% { box-shadow: 0 0 28px 8px hsl(var(--primary) / 0.22), 0 0 56px 18px hsl(var(--primary) / 0.1); }
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
              className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
              style={{
                background: logo.bg,
                boxShadow: "0 0 20px 4px hsl(var(--primary) / 0.12), 0 4px 12px hsl(0 0% 0% / 0.25)",
                border: "2px solid hsl(0 0% 100% / 0.3)",
              }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="w-[70%] h-[70%] object-contain"
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default FloatingLogos;
