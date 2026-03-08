import bannerWI from "@/assets/banner_w_i-2.jpg";
import logoWispro from "@/assets/logo-wispro.png";
import logoAcs from "@/assets/logo-acs.png";

const particles = Array.from({ length: 15 }, (_, i) => ({
  size: 3 + (i * 7 % 5),
  left: (i * 17 + 5) % 100,
  top: (i * 23 + 10) % 100,
  duration: 8 + (i % 4) * 3,
  delay: (i * 0.7) % 5,
  variant: (i % 3) + 1,
}));

const AppBanner = () => (
  <>
    <style>{`
      @keyframes float1 {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
        25% { transform: translate(15px, -20px) scale(1.2); opacity: 0.3; }
        50% { transform: translate(-10px, -35px) scale(1); opacity: 0.2; }
        75% { transform: translate(20px, -15px) scale(0.8); opacity: 0.25; }
      }
      @keyframes float2 {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
        33% { transform: translate(-20px, -25px) scale(1.3); opacity: 0.25; }
        66% { transform: translate(15px, -40px) scale(0.9); opacity: 0.2; }
      }
      @keyframes float3 {
        0%, 100% { transform: translate(0, 0) scale(0.8); opacity: 0.2; }
        50% { transform: translate(25px, -30px) scale(1.1); opacity: 0.35; }
      }
    `}</style>
    <header className="w-full overflow-hidden relative h-20">
      {/* Background image */}
      <img
        src={bannerWI}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
        aria-hidden="true"
      />
      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-8">
        <h2 className="text-white font-bold text-sm sm:text-base md:text-lg leading-tight drop-shadow-md" style={{ fontFamily: "'Exo', sans-serif" }}>
          Gestión completa de tu<br />proveedor de internet
        </h2>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <img src={logoWispro} alt="Wispro" className="h-8 sm:h-10 md:h-12 w-auto drop-shadow-md" />
          <span className="text-white font-bold text-base sm:text-lg md:text-xl drop-shadow-md">+</span>
          <img src={logoAcs} alt="IXC Soft" className="h-8 sm:h-10 md:h-12 w-auto drop-shadow-md" />
        </div>
      </div>
      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animation: `float${p.variant} ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </header>
  </>
);

export default AppBanner;
