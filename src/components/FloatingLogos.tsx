import logoIxc from "@/assets/logo-ixc-sphere.png";
import logoOlli from "@/assets/logo-olli.png";
import logoOpasuite from "@/assets/logo-opasuite-clean.png";
import logoWispro from "@/assets/logo-wispro-circle.png";
import logoHola from "@/assets/logo-hola-circle.png";

const logos = [
  { src: logoWispro, alt: "Wispro", size: 82, top: "12%", left: "30%", delay: 0, duration: 12, imgScale: 1.6, offsetX: "-3%", offsetY: "5%" },
  { src: logoIxc, alt: "IXC", size: 76, top: "8%", left: "58%", delay: 1.2, duration: 14, imgScale: 1.0, offsetX: "0%", offsetY: "0%", bg: "#1a4a5e" },
  { src: logoHola, alt: "Hola Suite", size: 80, top: "38%", left: "18%", delay: 0.5, duration: 11, imgScale: 1.6, offsetX: "0%", offsetY: "0%" },
  { src: logoOpasuite, alt: "Opa Suite", size: 70, top: "50%", left: "68%", delay: 2, duration: 13, imgScale: 0.8, offsetX: "0%", offsetY: "0%" },
  { src: logoOlli, alt: "Olli", size: 66, top: "68%", left: "25%", delay: 1.5, duration: 15, imgScale: 0.8, offsetX: "0%", offsetY: "0%" },
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
            className="absolute z-20 pointer-events-none rounded-full"
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
              className="w-full h-full rounded-full overflow-hidden relative"
              style={{
                background: logo.bg || "#ffffff",
                boxShadow: `
                  0 6px 20px hsl(0 0% 0% / 0.3),
                  0 0 20px 4px hsl(var(--primary) / 0.12),
                  inset -6px -6px 14px hsl(0 0% 0% / 0.1),
                  inset 4px 4px 10px hsl(0 0% 100% / 0.8)
                `,
              }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: `${logo.imgScale * 100}%`,
                  height: `${logo.imgScale * 100}%`,
                  maxWidth: "none",
                  maxHeight: "none",
                  transform: `translate(calc(-50% + ${logo.offsetX}), calc(-50% + ${logo.offsetY}))`,
                  objectFit: "contain",
                }}
              />
              {/* 3D shine overlay */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `
                    radial-gradient(circle at 35% 25%, hsl(0 0% 100% / 0.45) 0%, transparent 45%),
                    radial-gradient(circle at 70% 80%, hsl(0 0% 0% / 0.06) 0%, transparent 40%)
                  `,
                }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default FloatingLogos;
