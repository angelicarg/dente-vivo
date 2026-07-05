import { useState, useEffect, useRef } from "react";
import { Avatar } from "./Avatar";

const WHATSAPP = "https://wa.me/5562933334444";

const MAIN_MENU = [
  { label: "📅 Agendar consulta", flow: "agendar" },
  { label: "🦷 Especialidades", flow: "especialidades" },
  { label: "👨‍⚕️ Nossos dentistas", flow: "dentistas" },
  { label: "📍 Localização & horários", flow: "localizacao" },
  { label: "💳 Convênios & valores", flow: "convenios" },
  { label: "💬 Falar com atendente", flow: "atendente" },
];

const SERVICES = [
  { icon: "🦷", title: "Ortodontia", desc: "Aparelhos metálicos, estéticos e alinhadores invisíveis." },
  { icon: "🔩", title: "Implantes", desc: "Reposição de dentes com implantes de titânio de alta durabilidade." },
  { icon: "✨", title: "Estética Dental", desc: "Lentes de contato, clareamento e harmonização do sorriso." },
  { icon: "🩺", title: "Endodontia", desc: "Tratamento de canal moderno, rápido e indolor." },
  { icon: "👶", title: "Odontopediatria", desc: "Cuidado especializado para crianças com ambiente acolhedor." },
  { icon: "🧹", title: "Limpeza & Prevenção", desc: "Profilaxia, aplicação de flúor e orientação de higiene bucal." },
];

export function ChatBot({ dentists, onOpenScheduling }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([
      { id: 1, from: "bot", type: "text", text: "Olá! 😊 Seja bem-vindo à **Clínica Dente Vivo**. Sou a Ana, assistente virtual. Como posso te ajudar hoje?" },
      { id: 2, from: "bot", type: "options", options: MAIN_MENU },
    ]);
  }, []);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages]);

  function addMessages(newMsgs) {
    setMessages((prev) => [...prev, ...newMsgs.map((m, i) => ({ ...m, id: Date.now() + i }))]);
  }

  function userPick(label) {
    addMessages([{ from: "user", type: "text", text: label }]);
  }

  function backToMenu() {
    addMessages([
      { from: "bot", type: "text", text: "Posso te ajudar com mais alguma coisa?" },
      { from: "bot", type: "options", options: MAIN_MENU },
    ]);
  }

  function handleFlow(flow) {
    switch (flow) {
      case "agendar":
        userPick("📅 Agendar consulta");
        addMessages([
          { from: "bot", type: "text", text: "Vou abrir nossa agenda online — é rapidinho, escolha a especialidade, o dentista e o melhor horário pra você. 👇" },
        ]);
        setTimeout(() => onOpenScheduling(), 400);
        break;

      case "especialidades":
        userPick("🦷 Especialidades");
        addMessages([
          { from: "bot", type: "text", text: "Oferecemos as seguintes especialidades:" },
          { from: "bot", type: "service_list" },
          { from: "bot", type: "options", options: [
            { label: "📅 Agendar consulta", flow: "agendar" },
            { label: "← Voltar ao menu", flow: "menu" },
          ]},
        ]);
        break;

      case "dentistas":
        userPick("👨‍⚕️ Nossos dentistas");
        addMessages([
          { from: "bot", type: "text", text: "Conheça nossa equipe de especialistas:" },
          { from: "bot", type: "all_dentists" },
          { from: "bot", type: "options", options: [
            { label: "📅 Agendar com um deles", flow: "agendar" },
            { label: "← Voltar ao menu", flow: "menu" },
          ]},
        ]);
        break;

      case "localizacao":
        userPick("📍 Localização & horários");
        addMessages([
          { from: "bot", type: "location_card" },
          { from: "bot", type: "options", options: [
            { label: "📅 Agendar consulta", flow: "agendar" },
            { label: "← Voltar ao menu", flow: "menu" },
          ]},
        ]);
        break;

      case "convenios":
        userPick("💳 Convênios & valores");
        addMessages([
          { from: "bot", type: "text", text: "Trabalhamos com os principais convênios odontológicos:" },
          { from: "bot", type: "convenios_card" },
          { from: "bot", type: "options", options: [
            { label: "💬 Falar com atendente", flow: "atendente" },
            { label: "← Voltar ao menu", flow: "menu" },
          ]},
        ]);
        break;

      case "atendente":
        userPick("💬 Falar com atendente");
        window.open(WHATSAPP, "_blank");
        addMessages([
          { from: "bot", type: "text", text: "Você foi direcionado para o WhatsApp. Nossa equipe responde em até 10 minutos durante o horário de atendimento. 😊" },
        ]);
        setTimeout(() => backToMenu(), 600);
        break;

      case "menu":
        userPick("← Voltar ao menu");
        backToMenu();
        break;

      default:
        break;
    }
  }

  function renderMessage(msg) {
    const isUser = msg.from === "user";

    if (msg.type === "text") {
      const html = msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
          {!isUser && <BotAvatar />}
          <div
            style={{
              maxWidth: "82%", padding: "10px 14px",
              background: isUser ? "linear-gradient(135deg, #2C6E8A, #1A5276)" : "#fff",
              color: isUser ? "#fff" : "#1A3A4A",
              borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              fontSize: 13.5, lineHeight: 1.55,
              border: !isUser ? "1px solid #DDE8EE" : "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      );
    }

    if (msg.type === "options") {
      const isLast = messages[messages.length - 1]?.id === msg.id || messages[messages.length - 2]?.id === msg.id;
      return (
        <div style={{ paddingLeft: 36 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {msg.options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => isLast && handleFlow(opt.flow)}
                disabled={!isLast}
                style={{
                  background: isLast ? "#F0F6FA" : "#F8FBFD",
                  border: `1.5px solid ${isLast ? "#2C6E8A33" : "#E2EEF4"}`,
                  borderRadius: 10, padding: "9px 14px",
                  fontSize: 13, fontWeight: 600,
                  color: isLast ? "#1A3A4A" : "#AAA",
                  cursor: isLast ? "pointer" : "default",
                  textAlign: "left", transition: "all 0.15s",
                  opacity: isLast ? 1 : 0.5,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (msg.type === "all_dentists") {
      return (
        <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", gap: 8 }}>
          {dentists.map((d) => (
            <div key={d.id} style={{ background: "#fff", border: "1px solid #DDE8EE", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar dentist={d} size={38} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1A3A4A" }}>{d.name}</div>
                <div style={{ fontSize: 12, color: d.color, fontWeight: 600 }}>{d.specialty}</div>
                <div style={{ fontSize: 11, color: "#8AA4B0", marginTop: 2, lineHeight: 1.4 }}>{d.bio}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (msg.type === "service_list") {
      return (
        <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", gap: 7 }}>
          {SERVICES.map((s) => (
            <div key={s.title} style={{ background: "#fff", border: "1px solid #DDE8EE", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1A3A4A" }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "#8AA4B0", lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (msg.type === "location_card") {
      return (
        <div style={{ paddingLeft: 36 }}>
          <div style={{ background: "#fff", border: "1px solid #DDE8EE", borderRadius: 14, padding: "16px" }}>
            {[
              { icon: "📍", label: "Endereço", value: "Av. Brasil, 1.240 — Centro, Goiânia – GO" },
              { icon: "🕐", label: "Horário", value: "Seg–Sex: 8h às 19h | Sáb: 8h às 13h" },
              { icon: "📞", label: "Telefone", value: "(62) 3333-4444" },
              { icon: "📱", label: "WhatsApp", value: "(62) 99999-8888" },
            ].map((c) => (
              <div key={c.label} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: "#8AA4B0", fontWeight: 600 }}>{c.label}</div>
                  <div style={{ fontSize: 13, color: "#1A3A4A", fontWeight: 500 }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (msg.type === "convenios_card") {
      return (
        <div style={{ paddingLeft: 36 }}>
          <div style={{ background: "#fff", border: "1px solid #DDE8EE", borderRadius: 14, padding: "16px" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1A3A4A", marginBottom: 8 }}>Convênios aceitos</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Unimed", "Bradesco Saúde", "Amil", "SulAmérica", "Interodonto", "OdontoPrev", "Porto Seguro"].map((c) => (
                  <span key={c} style={{ background: "#F0F6FA", border: "1px solid #DDE8EE", borderRadius: 100, padding: "4px 10px", fontSize: 12, color: "#2C6E8A", fontWeight: 600 }}>{c}</span>
                ))}
              </div>
            </div>
            <div style={{ borderTop: "1px solid #EEF4F8", paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1A3A4A", marginBottom: 6 }}>Consulta particular</div>
              <div style={{ fontSize: 13, color: "#4A6572", lineHeight: 1.5 }}>
                Avaliação inicial: <strong style={{ color: "#2C6E8A" }}>Gratuita</strong><br />
                Consultas a partir de <strong style={{ color: "#2C6E8A" }}>R$ 120</strong><br />
                Parcelamento em até 12x sem juros
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 500,
          width: 62, height: 62, borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg, #2C6E8A, #1A5276)",
          color: "#fff", fontSize: 26, cursor: "pointer",
          boxShadow: "0 6px 24px rgba(44,110,138,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s",
        }}
      >
        {open ? "✕" : "💬"}
        {!open && unread > 0 && (
          <span
            style={{
              position: "absolute", top: -3, right: -3,
              background: "#4ECDC4", color: "#0D2D3E",
              borderRadius: "50%", width: 20, height: 20,
              fontSize: 11, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "fixed", bottom: 102, right: 28, zIndex: 499,
            width: "min(390px, calc(100vw - 32px))",
            background: "#F8FBFD",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(10,28,40,0.28)",
            border: "1px solid #DDE8EE",
            display: "flex", flexDirection: "column",
            maxHeight: "72vh",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1A3A4A, #2C6E8A)",
              borderRadius: "20px 20px 0 0",
              padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 12,
            }}
          >
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>👩‍⚕️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Ana</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Assistente · Clínica Dente Vivo</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ECDC4", boxShadow: "0 0 6px #4ECDC4" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>online</span>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg) => (
              <div key={msg.id}>{renderMessage(msg)}</div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: "10px 16px", borderTop: "1px solid #DDE8EE", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#8AA4B0" }}>🦷 Clínica Dente Vivo · Atendimento automatizado</span>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer"
              style={{ marginLeft: "auto", background: "#25D366", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
            >
              📱 WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function BotAvatar() {
  return (
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #2C6E8A, #1A5276)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
      👩‍⚕️
    </div>
  );
}
