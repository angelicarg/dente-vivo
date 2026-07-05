import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { Avatar, formatDate, formatTime } from "./Avatar";

export function SchedulingModal({ onClose, initialSpecialty }) {
  const [step, setStep] = useState(1);
  const [dentists, setDentists] = useState([]);
  const [loadingDentists, setLoadingDentists] = useState(true);
  const [specialty, setSpecialty] = useState(initialSpecialty || "");
  const [dentistId, setDentistId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    supabase
      .from("dentists")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (!error) setDentists(data || []);
        setLoadingDentists(false);
      });
  }, []);

  const specialties = useMemo(() => [...new Set(dentists.map((d) => d.specialty))], [dentists]);
  const filteredDentists = specialty ? dentists.filter((d) => d.specialty === specialty) : dentists;
  const dentist = dentists.find((d) => d.id === dentistId);

  useEffect(() => {
    if (!dentistId) return;
    setLoadingSlots(true);
    setSelectedDate("");
    setSelectedSlotId(null);
    supabase
      .from("time_slots")
      .select("*")
      .eq("dentist_id", dentistId)
      .eq("is_available", true)
      .gte("slot_date", new Date().toISOString().slice(0, 10))
      .order("slot_date")
      .order("slot_time")
      .then(({ data, error }) => {
        if (!error) setSlots(data || []);
        setLoadingSlots(false);
      });
  }, [dentistId]);

  const availableDates = [...new Set(slots.map((s) => s.slot_date))];
  const timesForSelectedDate = slots.filter((s) => s.slot_date === selectedDate);

  async function handleConfirm() {
    if (!form.name || !form.phone || !selectedSlotId) return;
    setSubmitting(true);
    setSubmitError("");

    const { error } = await supabase.rpc("book_appointment", {
      p_slot_id: selectedSlotId,
      p_name: form.name,
      p_phone: form.phone,
      p_email: form.email || null,
      p_note: form.note || null,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError(
        error.message.includes("já foi reservado")
          ? "Ops! Esse horário acabou de ser reservado por outra pessoa. Escolha outro."
          : "Não foi possível confirmar o agendamento agora. Tente novamente em instantes."
      );
      return;
    }

    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <ModalShell onClose={onClose}>
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: "#1A3A4A", marginBottom: 8, fontSize: 22 }}>Consulta agendada!</h2>
          <p style={{ color: "#4A6572", marginBottom: 24, lineHeight: 1.6 }}>
            <strong>{form.name}</strong>, sua consulta com <strong>{dentist?.name}</strong>
            <br />
            foi solicitada para <strong>{formatDate(selectedDate)}</strong> às{" "}
            <strong>{formatTime(timesForSelectedDate.find((s) => s.id === selectedSlotId)?.slot_time)}</strong>.
          </p>
          <p style={{ color: "#8AA4B0", fontSize: 13, marginBottom: 24 }}>
            A clínica vai confirmar seu horário em breve. Você pode acompanhar pelo telefone informado.
          </p>
          <button onClick={onClose} style={btnPrimary}>Fechar</button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: step >= s ? "#2C6E8A" : "#DDE8EE",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3 style={modalTitle}>Escolha a especialidade</h3>
          {loadingDentists ? (
            <p style={modalSub}>Carregando...</p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {specialties.map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSpecialty(sp === specialty ? "" : sp)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      transition: "all 0.2s",
                      background: specialty === sp ? "#2C6E8A" : "#F0F6FA",
                      color: specialty === sp ? "#fff" : "#1A3A4A",
                      border: specialty === sp ? "none" : "1px solid #DDE8EE",
                    }}
                  >
                    {sp}
                  </button>
                ))}
              </div>

              <h3 style={{ ...modalTitle, marginTop: 24 }}>Escolha o dentista</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {filteredDentists.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDentistId(d.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 16px",
                      borderRadius: 12,
                      cursor: "pointer",
                      border: dentistId === d.id ? `2px solid ${d.color}` : "1px solid #DDE8EE",
                      background: dentistId === d.id ? `${d.color}10` : "#F8FBFD",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    <Avatar dentist={d} size={44} />
                    <div>
                      <div style={{ fontWeight: 600, color: "#1A3A4A", fontSize: 14 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: d.color, fontWeight: 500 }}>{d.specialty}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
          <button disabled={!dentistId} onClick={() => setStep(2)} style={dentistId ? btnPrimary : btnDisabled}>
            Continuar →
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <button onClick={() => setStep(1)} style={backBtn}>← Voltar</button>
          <h3 style={modalTitle}>Escolha a data e horário</h3>
          {dentist && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "10px 14px", background: "#F0F6FA", borderRadius: 10 }}>
              <Avatar dentist={dentist} size={36} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#1A3A4A" }}>{dentist.name}</div>
                <div style={{ fontSize: 12, color: dentist.color }}>{dentist.specialty}</div>
              </div>
            </div>
          )}

          {loadingSlots ? (
            <p style={modalSub}>Carregando horários...</p>
          ) : availableDates.length === 0 ? (
            <p style={modalSub}>Nenhum horário disponível no momento para este dentista.</p>
          ) : (
            <>
              <p style={modalSub}>Datas disponíveis</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {availableDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedSlotId(null); }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      border: selectedDate === date ? "none" : "1px solid #DDE8EE",
                      background: selectedDate === date ? "#2C6E8A" : "#F0F6FA",
                      color: selectedDate === date ? "#fff" : "#1A3A4A",
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(date)}
                  </button>
                ))}
              </div>

              {selectedDate && (
                <>
                  <p style={modalSub}>Horários disponíveis</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                    {timesForSelectedDate.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSlotId(s.id)}
                        style={{
                          padding: "8px 18px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 14,
                          border: selectedSlotId === s.id ? "none" : "1px solid #DDE8EE",
                          background: selectedSlotId === s.id ? "#2C6E8A" : "#F0F6FA",
                          color: selectedSlotId === s.id ? "#fff" : "#1A3A4A",
                          fontWeight: 500,
                        }}
                      >
                        {formatTime(s.slot_time)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <button
            disabled={!selectedSlotId}
            onClick={() => setStep(3)}
            style={selectedSlotId ? btnPrimary : btnDisabled}
          >
            Continuar →
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <button onClick={() => setStep(2)} style={backBtn}>← Voltar</button>
          <h3 style={modalTitle}>Seus dados</h3>

          <div style={{ padding: "12px 16px", background: "#F0F6FA", borderRadius: 10, marginBottom: 20, fontSize: 13, color: "#1A3A4A", lineHeight: 1.7 }}>
            <strong>{dentist?.name}</strong> · {dentist?.specialty}
            <br />
            📅 {formatDate(selectedDate)} às {formatTime(timesForSelectedDate.find((s) => s.id === selectedSlotId)?.slot_time)}
          </div>

          {[
            { label: "Nome completo *", key: "name", placeholder: "Seu nome", type: "text" },
            { label: "WhatsApp *", key: "phone", placeholder: "(00) 00000-0000", type: "tel" },
            { label: "E-mail", key: "email", placeholder: "seu@email.com", type: "email" },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4A6572", marginBottom: 5 }}>{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={inputStyle}
              />
            </div>
          ))}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4A6572", marginBottom: 5 }}>Observações</label>
            <textarea
              placeholder="Algum detalhe importante sobre seu caso..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              style={{ ...inputStyle, height: 80, resize: "vertical" }}
            />
          </div>

          {submitError && (
            <p style={{ color: "#C0392B", fontSize: 13, marginBottom: 14 }}>{submitError}</p>
          )}

          <button
            disabled={!form.name || !form.phone || submitting}
            onClick={handleConfirm}
            style={form.name && form.phone && !submitting ? btnPrimary : btnDisabled}
          >
            {submitting ? "Enviando..." : "Confirmar agendamento"}
          </button>
        </div>
      )}
    </ModalShell>
  );
}

function ModalShell({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(10,28,40,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 16, backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "#fff", borderRadius: 20, padding: "32px 28px",
          width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 60px rgba(10,28,40,0.25)", position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#8AA4B0", lineHeight: 1 }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

const btnPrimary = {
  background: "linear-gradient(135deg, #2C6E8A, #1A5276)", color: "#fff", border: "none",
  padding: "12px 28px", borderRadius: 10, fontWeight: 600, fontSize: 14,
  cursor: "pointer", boxShadow: "0 4px 14px rgba(44,110,138,0.3)",
};

const btnDisabled = {
  background: "#DDE8EE", color: "#8AA4B0", border: "none",
  padding: "12px 28px", borderRadius: 10, fontWeight: 600,
  fontSize: 14, cursor: "not-allowed",
};

const backBtn = {
  background: "none", border: "none", color: "#2C6E8A",
  fontSize: 13, fontWeight: 600, cursor: "pointer",
  padding: 0, marginBottom: 16, display: "block",
};

const modalTitle = { fontSize: 18, fontWeight: 700, color: "#1A3A4A", marginBottom: 4 };
const modalSub = { fontSize: 13, color: "#8AA4B0", marginBottom: 14 };

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1.5px solid #DDE8EE", fontSize: 14, color: "#1A3A4A",
  outline: "none", fontFamily: "Inter, sans-serif", background: "#F8FBFD",
};
