import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoHola from "@/assets/logo-hola.png";
import AppMenu from "@/components/AppMenu";
import { Bot, Link, FolderOpen, Clock, Layers, BarChart3, Tag, Star, MessageCircle, TrendingUp, Target, Building2, Quote } from "lucide-react";

const countryCodes = [
  { code: "+54", label: "🇦🇷 +54" },
  { code: "+55", label: "🇧🇷 +55" },
  { code: "+56", label: "🇨🇱 +56" },
  { code: "+57", label: "🇨🇴 +57" },
  { code: "+52", label: "🇲🇽 +52" },
  { code: "+51", label: "🇵🇪 +51" },
  { code: "+598", label: "🇺🇾 +598" },
  { code: "+58", label: "🇻🇪 +58" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+34", label: "🇪🇸 +34" },
];

const employeeOptions = ["1-10", "11-50", "51-200", "200+"];

const Landing = () => {
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", countryCode: "+54", phone: "",
    empresa: "", num_empleados: "", sitio_web: "",
  });
  const [sending, setSending] = useState(false);

  const scrollToForm = () => {
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.email || !form.phone || !form.empresa || !form.num_empleados || !form.sitio_web) {
      toast.error("Por favor completa todos los campos.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("leads" as any).insert({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      telefono: `${form.countryCode} ${form.phone}`,
      empresa: form.empresa,
      num_empleados: form.num_empleados,
      sitio_web: form.sitio_web,
    } as any);
    setSending(false);
    if (error) {
      toast.error("Hubo un error. Intenta de nuevo.");
    } else {
      toast.success("¡Recibimos tu solicitud! Te contactaremos pronto.");
      setForm({ nombre: "", apellido: "", email: "", countryCode: "+54", phone: "", empresa: "", num_empleados: "", sitio_web: "" });
    }
  };

  const inputClass = "w-full rounded-lg border-0 bg-white/95 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]";

  return (
    <div className="font-['Poppins',sans-serif] overflow-x-hidden">
      {/* App menu */}
      <div className="fixed top-4 left-4 z-50">
        <AppMenu />
      </div>

      {/* SECTION 1 — HERO */}
      <section className="relative bg-gradient-to-br from-[#5B2FBE] via-[#5B2FBE] to-[#3D1FA3] px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left column */}
          <div className="space-y-6">
            <img src={logoHola} alt="¡Hola! Suite" className="h-12 w-auto" />
            <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
              Tu equipo <span className="text-[#FF6B00]">pierde horas</span> respondiendo mensajes que <span className="text-[#FF6B00]">¡Hola! Suite</span> resolvería en segundos
            </h1>
            <div className="inline-block bg-[#FF6B00] rounded-lg px-4 py-2">
              <p className="text-white font-semibold text-sm lg:text-base">La plataforma omnichannel en el centro de tu atención. Resultados en cada conversación.</p>
            </div>
            <p className="text-white/80 text-base lg:text-lg">
              Unifica WhatsApp, Instagram, Messenger, Telegram y más en un solo lugar. Atiende a tus clientes 24/7 con agentes virtuales entrenados para tu negocio.
            </p>
          </div>

          {/* Right column — Form */}
          <div id="hero-form" className="bg-[#3D1FA3]/80 backdrop-blur rounded-2xl p-6 lg:p-8 shadow-2xl shadow-[#FF6B00]/10">
            <h2 className="text-white font-bold text-xl mb-6">Conecta tu empresa con el mundo ahora mismo.</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input className={inputClass} placeholder="Tu nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                <input className={inputClass} placeholder="Tu apellido" value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} />
              </div>
              <input className={inputClass} type="email" placeholder="Tu mejor correo" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <div className="flex gap-2">
                <select className="rounded-lg border-0 bg-white/95 px-3 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] w-28" value={form.countryCode} onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))}>
                  {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <input className={inputClass} type="tel" placeholder="Tu teléfono" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <input className={inputClass} placeholder="Nombre de tu empresa" value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} />
              <select className={`${inputClass} ${!form.num_empleados ? "text-gray-400" : ""}`} value={form.num_empleados} onChange={e => setForm(f => ({ ...f, num_empleados: e.target.value }))}>
                <option value="" disabled>N° de empleados</option>
                {employeeOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <input className={inputClass} placeholder="www.tuempresa.com" value={form.sitio_web} onChange={e => setForm(f => ({ ...f, sitio_web: e.target.value }))} />
              <p className="text-white/40 text-xs">Al enviar, aceptas que usemos tus datos para contactarte. Consulta nuestra Política de Privacidad.</p>
              <button type="submit" disabled={sending} className="w-full bg-[#FF6B00] hover:bg-[#e55f00] text-white font-bold py-4 rounded-full text-sm lg:text-base transition-colors disabled:opacity-50">
                {sending ? "ENVIANDO..." : "QUIERO UNA DEMOSTRACIÓN GRATIS"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 2 — PROBLEMA + BENEFICIOS */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900">Mientras tú gestionas canales por separado, tus competidores ya ganaron más clientes.</h2>
            <p className="text-[#5B2FBE] text-lg font-medium">Con ¡Hola! Suite transformas tu operación y resuelves los principales desafíos del día a día.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <MessageCircle className="h-8 w-8" />, title: "Atención Instantánea", desc: "Recibe y responde mensajes de todas tus redes sin saltar de pantalla en pantalla." },
              { icon: <TrendingUp className="h-8 w-8" />, title: "Escala sin Contratar", desc: "Atiende más clientes sin aumentar tu equipo, con agentes virtuales que nunca descansan." },
              { icon: <Clock className="h-8 w-8" />, title: "Disponible Siempre", desc: "Tu empresa atiende 24 horas, 7 días a la semana, en el canal favorito de cada cliente." },
              { icon: <Star className="h-8 w-8" />, title: "Clientes más Felices", desc: "Encuestas de satisfacción automáticas al final de cada conversación para mejorar siempre." },
            ].map((b, i) => (
              <div key={i} className="bg-[#3D1FA3] rounded-2xl p-6 text-left space-y-3">
                <div className="text-purple-300">{b.icon}</div>
                <h3 className="text-white font-bold text-lg">{b.title}</h3>
                <p className="text-white/70 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
          <button onClick={scrollToForm} className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-bold py-3 px-8 rounded-full transition-colors">Quiero conocerlo</button>
        </div>
      </section>

      {/* SECTION 3 — FUNCIONALIDADES */}
      <section className="bg-[#3D1FA3] px-6 py-20">
        <div className="mx-auto max-w-6xl text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl lg:text-4xl font-bold text-white">Todo lo que tu equipo necesita en una sola plataforma</h2>
            <p className="text-white/70 text-lg">Múltiples funcionalidades que amplifican la eficiencia de tu operación.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: <Bot className="h-6 w-6" />, title: "Agente Virtual Inteligente", desc: "Crea múltiples agentes virtuales con flujos personalizados para cada área de tu empresa: ventas, soporte, cobranza." },
              { icon: <Link className="h-6 w-6" />, title: "Integración Omnichannel", desc: "Unifica WhatsApp, Instagram, Messenger, Telegram, Chat Web y Telefonía en una sola bandeja de entrada." },
              { icon: <FolderOpen className="h-6 w-6" />, title: "Envío de Archivos y Medios", desc: "Comparte documentos, audios, videos, emojis y plantillas pre-registradas directamente desde la plataforma." },
              { icon: <Clock className="h-6 w-6" />, title: "Horario de Atención Dinámico", desc: "Configura el horario de servicio de tu equipo y activa respuestas automáticas fuera de horario." },
              { icon: <Layers className="h-6 w-6" />, title: "Filas de Servicio Personalizables", desc: "Organiza filas por sector, prioridad o tipo de cliente para que cada caso llegue al agente correcto." },
              { icon: <BarChart3 className="h-6 w-6" />, title: "Gráficos y Reportes en Tiempo Real", desc: "Visualiza el tiempo promedio de atención, motivos de contacto y rendimiento de cada agente." },
              { icon: <Tag className="h-6 w-6" />, title: "Protocolos de Identificación", desc: "Cada conversación tiene un protocolo único que facilita el seguimiento y la trazabilidad del servicio." },
              { icon: <Star className="h-6 w-6" />, title: "Encuesta de Satisfacción", desc: "Evalúa la calidad de cada atención automáticamente al cierre de la conversación." },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 bg-white/5 rounded-xl p-5 text-left">
                <div className="shrink-0 bg-[#5B2FBE] rounded-lg p-3 text-purple-200">{f.icon}</div>
                <div>
                  <h3 className="text-white font-bold">{f.title}</h3>
                  <p className="text-white/60 text-sm mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={scrollToForm} className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-bold py-3 px-8 rounded-full transition-colors">Quiero ¡Hola! Suite</button>
        </div>
      </section>

      {/* SECTION 4 — PRUEBA SOCIAL */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl text-center space-y-12">
          <h2 className="text-2xl lg:text-4xl font-bold text-[#5B2FBE]">Más de 396 empresas en América Latina ya lo comprobaron</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Target className="h-8 w-8" />, number: "+9 segmentos", desc: "atendidos en todo Brasil" },
              { icon: <Building2 className="h-8 w-8" />, number: "+396 empresas", desc: "atendidas en América Latina" },
              { icon: <MessageCircle className="h-8 w-8" />, number: "+7 millones", desc: "de conversaciones gestionadas" },
            ].map((s, i) => (
              <div key={i} className="bg-purple-50 rounded-2xl p-8 space-y-2">
                <div className="text-[#5B2FBE] flex justify-center">{s.icon}</div>
                <p className="text-3xl font-bold text-[#5B2FBE]">{s.number}</p>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { quote: "¡Hola! Suite ayudó a nuestra empresa en el 100% de los servicios, permitiendo más agilidad y flexibilidad para atender a nuestros clientes con excelencia.", author: "Weslley Oliveira", company: "Turbinado Telecom" },
              { quote: "Monitorear el recorrido de atención al cliente es fundamental para fidelizarlos. ¡Hola! Suite ayuda mucho en este sentido, es una plataforma de servicio de atención sensacional.", author: "Dayane Fredirichis", company: "CSX Consulting" },
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 text-left space-y-4">
                <Quote className="h-8 w-8 text-[#FF6B00]" />
                <p className="text-gray-700 italic">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-gray-900">{t.author}</p>
                  <p className="text-sm text-gray-500">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={scrollToForm} className="bg-[#3D1FA3] hover:bg-[#5B2FBE] text-white font-bold py-3 px-8 rounded-full transition-colors">Quiero en mi empresa</button>
        </div>
      </section>

      {/* SECTION 5 — CIERRE */}
      <section className="bg-gradient-to-br from-[#5B2FBE] to-[#3D1FA3] px-6 py-20">
        <div className="mx-auto max-w-4xl text-center space-y-10">
          <h2 className="text-2xl lg:text-4xl font-bold text-white">Ten ¡Hola! Suite trabajando por tu empresa 24 horas al día, 7 días a la semana.</h2>
          <div className="bg-white/10 rounded-2xl p-8 flex items-center justify-center min-h-[250px]">
            <p className="text-white/50 text-lg">[ Dashboard Preview — Próximamente ]</p>
          </div>
          <button onClick={scrollToForm} className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-bold py-4 px-10 rounded-full text-lg transition-colors">Quiero empezar ahora</button>
          <div className="flex items-center justify-center gap-6 opacity-60">
            <span className="text-white text-xs">Meta Business Partner</span>
            <span className="text-white/40">|</span>
            <span className="text-white text-xs">IXC Soft</span>
          </div>
          <footer className="text-white/30 text-xs pt-6 border-t border-white/10">
            MXCSOFT SISTEMAS LTDA · comercial@holasuite.com · Política de Privacidad
          </footer>
        </div>
      </section>
    </div>
  );
};

export default Landing;
