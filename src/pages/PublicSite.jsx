import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Avatar } from "../components/Avatar";
import { SchedulingModal } from "../components/SchedulingModal";
import { ChatBot } from "../components/ChatBot";

const SERVICES = [
  { icon: "🦷", title: "Ortodontia", desc: "Aparelhos metálicos, estéticos e alinhadores invisíveis para um sorriso alinhado." },
  { icon: "🔩", title: "Implantes", desc: "Reposição de dentes com implantes de titânio de alta durabilidade." },
  { icon: "✨", title: "Estética Dental", desc: "Lentes de contato, clareamento e harmonização do sorriso." },
  { icon: "🩺", title: "Endodontia", desc: "Tratamento de canal moderno, rápido e indolor." },
  { icon: "👶", title: "Odontopediatria", desc: "Cuidado especializado para crianças com ambiente acolhedor." },
  { icon: "🧹", title: "Limpeza & Prevenção", desc: "Profilaxia, aplicação de flúor e orientação de higiene bucal." },
];

const TESTIMONIALS = [
  { name: "Mariana T.", text: "Fiz meu tratamento com a Dra. Camila e nunca sorri tanto. Atendimento impecável e resultado incrível.", rating: 5 },
  { name: "Pedro A.", text: "O Dr. Rafael colocou meu implante e o processo foi muito mais tranquilo do que eu imaginava. Recomendo demais.", rating: 5 },
  { name: "Cláudia M.", text: "Minha filha adorou a Dra. Juliana. Antes tinha pavor de dentista, agora pede pra vir consultar!", rating: 5 },
  { name: "Roberto S.", text: "Clínica moderna, limpa e com profissionais muito atenciosos. Voltarei com certeza.", rating: 5 },
];

function Stars({ count = 5 }) {
  return <span style={{ color: "#C8A951", fontSize: 14 }}>{"★".repeat(count)}</span>;
}

const navLinks = [
  { id: "inicio", label: "Início" },
  { id: "servicos", label: "Serviços" },
  { id: "equipe", label: "Equipe" },
  { id: "depoimentos", label: "Depoimentos" },
  { id: "contato", label: "Contato" },
];

export default function PublicSite() {
  const [dentists, setDentists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalSpecialty, setModalSpecialty] = useState("");

  useEffect(() => {
    supabase
      .from("dentists")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (!error) setDentists(data || []);
      });
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Inter', sans-serif; background: #F8FBFD; color: #1A3A4A; }
      html { scroll-behavior: smooth; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #F0F6FA; }
      ::-webkit-scrollbar-thumb { background: #2C6E8A44; border-radius: 3px; }
      .nav-link { transition: color 0.2s; }
      .nav-link:hover { color: #2C6E8A !important; }
      .service-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(44,110,138,0.12) !important; }
      .dentist-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(44,110,138,0.10) !important; }
      .service-card, .dentist-card { transition: transform 0.25s, box-shadow 0.25s; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      .hero-badge { animation: fadeDown 0.7s ease both; }
      .hero-title { animation: fadeUp 0.7s 0.15s ease both; }
      .hero-sub { animation: fadeUp 0.7s 0.3s ease both; }
      .hero-cta { animation: fadeUp 0.7s 0.45s ease both; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  function openScheduling(specialty = "") {
    setModalSpecialty(specialty);
    setShowModal(true);
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1A3A4A", background: "#F8FBFD" }}>
      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E2EEF4",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", height: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #2C6E8A, #1A5276)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 18 }}>🦷</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: "#1A3A4A", letterSpacing: 0.3 }}>Dente Vivo</span>
        </div>

        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {navLinks.map((l) => (
            <a key={l.id} href={`#${l.id}`} className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: "#4A6572", textDecoration: "none" }}>
              {l.label}
            </a>
          ))}
          <button onClick={() => openScheduling()} style={{ ...btnPrimary, padding: "9px 20px", fontSize: 13, borderRadius: 8 }}>
            Agendar Consulta
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="inicio" style={{ minHeight: "100vh", paddingTop: 64, background: "linear-gradient(160deg, #0D2D3E 0%, #1A4A5E 50%, #2C6E8A 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 32px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)" }} />
        <div style={{ maxWidth: 720, textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 100, padding: "6px 18px", marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, background: "#4ECDC4", borderRadius: "50%", display: "inline-block" }} />
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500 }}>Especialistas em saúde bucal desde 2010</span>
          </div>
          <h1 className="hero-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 6vw, 62px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 22 }}>
            O seu sorriso merece<br /><span style={{ color: "#4ECDC4" }}>cuidado de verdade</span>
          </h1>
          <p className="hero-sub" style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, marginBottom: 40, maxWidth: 520, margin: "0 auto 40px" }}>
            Cinco especialistas dedicados a transformar a sua saúde bucal com tecnologia moderna e atendimento personalizado.
          </p>
          <div className="hero-cta" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => openScheduling()} style={{ background: "#4ECDC4", color: "#0D2D3E", border: "none", padding: "14px 32px", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 8px 24px rgba(78,205,196,0.35)" }}>
              Agendar Consulta
            </button>
            <a href="#equipe" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", padding: "14px 28px", borderRadius: 10, fontWeight: 500, fontSize: 15, textDecoration: "none", display: "inline-block" }}>
              Conhecer a equipe
            </a>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 60, flexWrap: "wrap" }}>
            {[
              { value: "+5.000", label: "Pacientes atendidos" },
              { value: "15", label: "Anos de experiência" },
              { value: "5", label: "Especialistas" },
              { value: "98%", label: "Índice de satisfação" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#4ECDC4" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="servicos" style={{ padding: "96px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={eyebrow}>Nossas especialidades</span>
            <h2 style={sectionTitle}>Tratamentos completos<br />para toda a família</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {SERVICES.map((s) => (
              <div key={s.title} className="service-card" style={{ background: "#F8FBFD", borderRadius: 16, padding: "28px 24px", border: "1px solid #E2EEF4", boxShadow: "0 2px 8px rgba(44,110,138,0.05)" }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1A3A4A", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#4A6572", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="equipe" style={{ padding: "96px 32px", background: "#F0F6FA" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={eyebrow}>Nossa equipe</span>
            <h2 style={sectionTitle}>Profissionais que cuidam<br />do seu sorriso</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {dentists.map((d) => (
              <div key={d.id} className="dentist-card" style={{ background: "#fff", borderRadius: 18, padding: "28px 24px", border: "1px solid #E2EEF4", boxShadow: "0 2px 8px rgba(44,110,138,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                  <Avatar dentist={d} size={56} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#1A3A4A" }}>{d.name}</div>
                    <div style={{ fontSize: 13, color: d.color, fontWeight: 600, marginTop: 2 }}>{d.specialty}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "#4A6572", lineHeight: 1.65, marginBottom: 18 }}>{d.bio}</p>
                <button onClick={() => openScheduling(d.specialty)} style={{ background: "transparent", border: `1.5px solid ${d.color}`, color: d.color, borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Agendar com {d.name.split(" ")[1]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ background: "linear-gradient(135deg, #1A4A5E, #2C6E8A)", padding: "72px 32px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Pronto para transformar seu sorriso?</h2>
        <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: 32, fontSize: 16 }}>Agende agora e ganhe uma avaliação inicial sem custo.</p>
        <button onClick={() => openScheduling()} style={{ background: "#4ECDC4", color: "#0D2D3E", border: "none", padding: "14px 36px", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
          Agendar Consulta Gratuita
        </button>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="depoimentos" style={{ padding: "96px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={eyebrow}>Depoimentos</span>
            <h2 style={sectionTitle}>O que nossos pacientes dizem</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{ background: "#F8FBFD", borderRadius: 16, padding: "24px", border: "1px solid #E2EEF4" }}>
                <Stars count={t.rating} />
                <p style={{ fontSize: 14, color: "#4A6572", lineHeight: 1.7, margin: "12px 0 16px" }}>"{t.text}"</p>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1A3A4A" }}>— {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contato" style={{ padding: "96px 32px", background: "#F0F6FA" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <span style={eyebrow}>Contato</span>
            <h2 style={{ ...sectionTitle, textAlign: "left", marginBottom: 24 }}>Estamos aqui<br />para você</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { icon: "📍", label: "Endereço", value: "Av. Brasil, 1.240 — Centro, Goiânia – GO" },
                { icon: "📞", label: "Telefone", value: "(62) 3333-4444" },
                { icon: "📱", label: "WhatsApp", value: "(62) 99999-8888" },
                { icon: "🕐", label: "Horário", value: "Seg–Sex: 8h às 19h | Sáb: 8h às 13h" },
              ].map((c) => (
                <div key={c.label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#8AA4B0", marginBottom: 2 }}>{c.label}</div>
                    <div style={{ fontSize: 14, color: "#1A3A4A", fontWeight: 500 }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, border: "1px solid #E2EEF4", boxShadow: "0 4px 16px rgba(44,110,138,0.08)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1A3A4A", marginBottom: 6 }}>Agende agora</h3>
            <p style={{ fontSize: 13, color: "#4A6572", marginBottom: 22 }}>Escolha o dentista e o horário ideal para você.</p>
            <button onClick={() => openScheduling()} style={{ ...btnPrimary, width: "100%", justifyContent: "center", display: "flex" }}>
              Abrir agenda online
            </button>
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "#8AA4B0" }}>
              ou ligue: <strong style={{ color: "#2C6E8A" }}>(62) 3333-4444</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0D2D3E", padding: "32px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14 }}>🦷</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15, color: "#fff" }}>Dente Vivo</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>© 2026 Clínica Dente Vivo. Todos os direitos reservados.</p>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 8 }}>
          <a href="/admin/login" style={{ color: "inherit", textDecoration: "none" }}>Acesso da equipe</a>
        </p>
      </footer>

      {showModal && <SchedulingModal onClose={() => setShowModal(false)} initialSpecialty={modalSpecialty} />}
      <ChatBot dentists={dentists} onOpenScheduling={() => openScheduling()} />
    </div>
  );
}

const btnPrimary = {
  background: "linear-gradient(135deg, #2C6E8A, #1A5276)", color: "#fff", border: "none",
  padding: "12px 28px", borderRadius: 10, fontWeight: 600, fontSize: 14,
  cursor: "pointer", boxShadow: "0 4px 14px rgba(44,110,138,0.3)",
};

const eyebrow = { display: "inline-block", fontSize: 12, fontWeight: 700, color: "#2C6E8A", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 };

const sectionTitle = { fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, color: "#1A3A4A", lineHeight: 1.2, textAlign: "center" };
