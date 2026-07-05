import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { formatDate, formatTime } from "./Avatar";

export function AgendaManager() {
  const [dentists, setDentists] = useState([]);
  const [dentistId, setDentistId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningKey, setActioningKey] = useState(null);
  const [menu, setMenu] = useState(null); // { slot, mode: "choose" | "form" }
  const [bookForm, setBookForm] = useState({ name: "", phone: "" });
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState("");

  useEffect(() => {
    supabase
      .from("dentists")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (!error && data?.length) {
          setDentists(data);
          setDentistId(data[0].id);
        }
      });
  }, []);

  const loadSlots = useCallback(async () => {
    if (!dentistId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("time_slots")
      .select("*")
      .eq("dentist_id", dentistId)
      .gte("slot_date", new Date().toISOString().slice(0, 10))
      .order("slot_date")
      .order("slot_time");
    if (!error) setSlots(data || []);
    setLoading(false);
  }, [dentistId]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const byDate = useMemo(() => {
    const map = new Map();
    for (const s of slots) {
      if (!map.has(s.slot_date)) map.set(s.slot_date, []);
      map.get(s.slot_date).push(s);
    }
    return [...map.entries()];
  }, [slots]);

  function slotState(s) {
    if (s.is_available) return "open";
    if (s.blocked) return "blocked";
    return "booked";
  }

  async function toggleSlot(s) {
    setActioningKey(s.id);
    if (slotState(s) === "open") {
      await supabase.from("time_slots").update({ is_available: false, blocked: true }).eq("id", s.id);
    } else if (slotState(s) === "blocked") {
      await supabase.from("time_slots").update({ is_available: true, blocked: false }).eq("id", s.id);
    }
    await loadSlots();
    setActioningKey(null);
  }

  async function blockDay(date) {
    setActioningKey(date);
    await supabase
      .from("time_slots")
      .update({ is_available: false, blocked: true })
      .eq("dentist_id", dentistId)
      .eq("slot_date", date)
      .eq("is_available", true);
    await loadSlots();
    setActioningKey(null);
  }

  async function unblockDay(date) {
    setActioningKey(date);
    await supabase
      .from("time_slots")
      .update({ is_available: true, blocked: false })
      .eq("dentist_id", dentistId)
      .eq("slot_date", date)
      .eq("blocked", true);
    await loadSlots();
    setActioningKey(null);
  }

  function openMenu(s) {
    setMenu({ slot: s, mode: "choose" });
    setBookForm({ name: "", phone: "" });
    setBookError("");
  }

  function closeMenu() {
    setMenu(null);
    setBookError("");
  }

  async function handleBlockFromMenu() {
    await toggleSlot(menu.slot);
    closeMenu();
  }

  async function handleBookSubmit() {
    if (!bookForm.name || !bookForm.phone) return;
    setBooking(true);
    setBookError("");
    const { error: apptError } = await supabase.from("appointments").insert({
      time_slot_id: menu.slot.id,
      patient_name: bookForm.name,
      patient_phone: bookForm.phone,
      status: "confirmed",
    });
    if (apptError) {
      setBooking(false);
      setBookError("Não foi possível agendar. Tente novamente.");
      return;
    }
    await supabase.from("time_slots").update({ is_available: false }).eq("id", menu.slot.id);
    await loadSlots();
    setBooking(false);
    closeMenu();
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: "#8AA4B0", marginBottom: 16 }}>
        Bloqueie dias inteiros (férias, folgas, feriados) ou horários pontuais para cada dentista, ou agende
        diretamente um paciente que ligou ou foi até a clínica. Horários já reservados não podem ser alterados por aqui.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {dentists.map((d) => (
          <button
            key={d.id}
            onClick={() => setDentistId(d.id)}
            style={{
              padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: dentistId === d.id ? "none" : "1px solid #DDE8EE",
              background: dentistId === d.id ? d.color : "#fff",
              color: dentistId === d.id ? "#fff" : "#4A6572",
            }}
          >
            {d.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#8AA4B0", fontSize: 14 }}>Carregando agenda...</p>
      ) : byDate.length === 0 ? (
        <p style={{ color: "#8AA4B0", fontSize: 14 }}>Nenhum horário cadastrado para este dentista.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {byDate.map(([date, daySlots]) => {
            const hasOpen = daySlots.some((s) => slotState(s) === "open");
            const hasBlocked = daySlots.some((s) => slotState(s) === "blocked");
            return (
              <div key={date} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2EEF4", padding: "16px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  <strong style={{ fontSize: 14, color: "#1A3A4A" }}>{formatDate(date)}</strong>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      disabled={!hasOpen || actioningKey === date}
                      onClick={() => blockDay(date)}
                      style={smallBtn(hasOpen, "#C0392B")}
                    >
                      Bloquear dia inteiro
                    </button>
                    <button
                      disabled={!hasBlocked || actioningKey === date}
                      onClick={() => unblockDay(date)}
                      style={smallBtn(hasBlocked, "#117A65")}
                    >
                      Desbloquear dia
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {daySlots.map((s) => {
                    const state = slotState(s);
                    return (
                      <button
                        key={s.id}
                        disabled={state === "booked" || actioningKey === s.id}
                        onClick={() => (state === "open" ? openMenu(s) : toggleSlot(s))}
                        title={state === "booked" ? "Reservado por um paciente" : state === "blocked" ? "Clique para desbloquear" : "Clique para bloquear ou agendar um paciente"}
                        style={{
                          padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                          cursor: state === "booked" ? "default" : "pointer",
                          border: "1px solid",
                          borderColor: state === "open" ? "#DDE8EE" : state === "blocked" ? "#C0392B33" : "#117A6533",
                          background: state === "open" ? "#F8FBFD" : state === "blocked" ? "#FBEAEA" : "#EAF6F3",
                          color: state === "open" ? "#1A3A4A" : state === "blocked" ? "#C0392B" : "#117A65",
                          textDecoration: state === "blocked" ? "line-through" : "none",
                          outline: menu?.slot.id === s.id ? "2px solid #2C6E8A" : "none",
                          outlineOffset: 2,
                        }}
                      >
                        {formatTime(s.slot_time)}{state === "booked" ? " · reservado" : ""}
                      </button>
                    );
                  })}
                </div>

                {menu && menu.slot.slot_date === date && (
                  <div style={{ marginTop: 12, padding: "14px 16px", background: "#F0F6FA", borderRadius: 10 }}>
                    {menu.mode === "choose" ? (
                      <>
                        <p style={{ fontSize: 13, color: "#1A3A4A", marginBottom: 10 }}>
                          Horário <strong>{formatTime(menu.slot.slot_time)}</strong> livre — o que deseja fazer?
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button onClick={handleBlockFromMenu} style={menuBtn("#C0392B")}>🔒 Bloquear horário</button>
                          <button onClick={() => setMenu({ ...menu, mode: "form" })} style={menuBtn("#117A65")}>📝 Agendar paciente</button>
                          <button onClick={closeMenu} style={menuBtn("#8AA4B0")}>Cancelar</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 13, color: "#1A3A4A", marginBottom: 10 }}>
                          Agendar paciente para <strong>{formatTime(menu.slot.slot_time)}</strong>
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                          <input
                            placeholder="Nome do paciente"
                            value={bookForm.name}
                            onChange={(e) => setBookForm({ ...bookForm, name: e.target.value })}
                            style={menuInput}
                          />
                          <input
                            placeholder="Telefone / WhatsApp"
                            value={bookForm.phone}
                            onChange={(e) => setBookForm({ ...bookForm, phone: e.target.value })}
                            style={menuInput}
                          />
                        </div>
                        {bookError && <p style={{ fontSize: 12, color: "#C0392B", marginBottom: 8 }}>{bookError}</p>}
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={handleBookSubmit}
                            disabled={!bookForm.name || !bookForm.phone || booking}
                            style={menuBtn("#117A65", !bookForm.name || !bookForm.phone || booking)}
                          >
                            {booking ? "Agendando..." : "Confirmar agendamento"}
                          </button>
                          <button onClick={closeMenu} style={menuBtn("#8AA4B0")}>Cancelar</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function smallBtn(enabled, color) {
  return {
    background: enabled ? "#fff" : "#F8FBFD",
    border: `1.5px solid ${enabled ? color : "#E2EEF4"}`,
    color: enabled ? color : "#C7D6DC",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: enabled ? "pointer" : "not-allowed",
  };
}

function menuBtn(color, disabled = false) {
  return {
    background: disabled ? "#F8FBFD" : "#fff",
    border: `1.5px solid ${disabled ? "#E2EEF4" : color}`,
    color: disabled ? "#C7D6DC" : color,
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

const menuInput = {
  flex: "1 1 160px",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1.5px solid #DDE8EE",
  fontSize: 13,
  color: "#1A3A4A",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  background: "#fff",
};
