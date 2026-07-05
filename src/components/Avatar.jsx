export function Avatar({ dentist, size = 56 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${dentist.color}cc, ${dentist.color})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.3,
        flexShrink: 0,
        letterSpacing: 1,
      }}
    >
      {dentist.initials}
    </div>
  );
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const [, m, d] = dateStr.split("-");
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${d} ${months[parseInt(m, 10) - 1]}`;
}

export function formatTime(timeStr) {
  // Postgres "time" comes back as "09:00:00" — trim to "09:00".
  return timeStr ? timeStr.slice(0, 5) : "";
}
