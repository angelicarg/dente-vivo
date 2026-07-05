import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { formatDate, formatTime } from "../components/Avatar";

const STATUS_LABEL = {
  pending: "Pendente",
  confirmed: "Confirmado",
  rejected: "Recusado",
};

const STATUS_COLOR = {
  pending: "#B7770D",
  confirmed: "#117A65",
  rejected: "#C0392B",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/admin/login", { replace: true });
        return;
      }
      setCheckingSession(false);
    });
  }, [navigate]);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*, time_slots(*, dentists(*))")
      .order("created_at", { ascending: false });
    if (!error) setAppointments(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!checkingSession) loadAppointments();
  }, [checkingSession, loadAppointments]);

  async function handleConfirm(id) {
    setActioningId(id);
    await supabase.from("appointments").update({ status: "confirmed" }).eq("id", id);
    await loadAppointments();
    setActioningId(null);
  }

  async function handleReject(appointment) {
    setActioningId(appointment.id);
    await supabase.from("appointments").update({ status: "rejected" }).eq("id", appointment.id);
    await supabase.from("time_slots").update({ is_available: true }).eq("id", appointment.time_slot_id);
    await loadAppointments();
    setActioningId(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  if (checkingSession) return null;

  const visible = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FA", fontFamily: "'Inter', sans-serif" }}>
      <header
        style={{
          background: "#fff", borderBottom: "1px solid #DDE8EE",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #2C6E8A, #1A5276)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🦷</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "#1A3A4A" }}>Dente Vivo · Painel da equipe</span>
        </div>
        <button onClick={handleLogout} style={{ background: "none", border: "1px solid #DDE8EE", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#4A6572", cursor: "pointer" }}>
          Sair
        </button>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1A3A4A", marginBottom: 6 }}>Agendamentos</h1>
        <p style={{ fontSize: 13, color: "#8AA4B0", marginBottom: 24 }}>Confirme ou recuse os pedidos de consulta feitos pelo site.</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            ["pending", "Pendentes"],
            ["confirmed", "Confirmados"],
            ["rejected", "Recusados"],
            ["all", "Todos"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "7px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer",
                border: filter === key ? "none" : "1px solid #DDE8EE",
                background: filter === key ? "#2C6E8A" : "#fff",
                color: filter === key ? "#fff" : "#4A6572",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "#8AA4B0", fontSize: 14 }}>Carregando...</p>
        ) : visible.length === 0 ? (
          <p style={{ color: "#8AA4B0", fontSize: 14 }}>Nenhum agendamento nessa categoria.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visible.map((a) => {
              const dentist = a.time_slots?.dentists;
              return (
                <div key={a.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2EEF4", padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#1A3A4A" }}>{a.patient_name}</div>
                      <div style={{ fontSize: 13, color: "#4A6572", marginTop: 2 }}>
                        {a.patient_phone}
                        {a.patient_email ? ` · ${a.patient_email}` : ""}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
                        color: STATUS_COLOR[a.status], background: `${STATUS_COLOR[a.status]}15`,
                        borderRadius: 100, padding: "4px 12px", whiteSpace: "nowrap",
                      }}
                    >
                      {STATUS_LABEL[a.status]}
                    </span>
                  </div>

                  <div style={{ marginTop: 12, padding: "10px 14px", background: "#F8FBFD", borderRadius: 10, fontSize: 13, color: "#1A3A4A" }}>
                    <strong>{dentist?.name}</strong> · {dentist?.specialty}
                    <br />
                    📅 {formatDate(a.time_slots?.slot_date)} às {formatTime(a.time_slots?.slot_time)}
                  </div>

                  {a.note && (
                    <p style={{ marginTop: 10, fontSize: 13, color: "#4A6572", fontStyle: "italic" }}>"{a.note}"</p>
                  )}

                  {a.status === "pending" && (
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <button
                        disabled={actioningId === a.id}
                        onClick={() => handleConfirm(a.id)}
                        style={{ background: "#117A65", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: actioningId === a.id ? 0.6 : 1 }}
                      >
                        ✅ Confirmar
                      </button>
                      <button
                        disabled={actioningId === a.id}
                        onClick={() => handleReject(a)}
                        style={{ background: "#fff", color: "#C0392B", border: "1.5px solid #C0392B", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: actioningId === a.id ? 0.6 : 1 }}
                      >
                        ✕ Recusar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
