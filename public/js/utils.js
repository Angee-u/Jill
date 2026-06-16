function formatDate(dateStr, style = "full") {
  if (!dateStr) return "data desconhecida";

  try {
    const options =
      style === "short"
        ? {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }
        : {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          };

    return new Date(dateStr).toLocaleDateString("pt-BR", options);
  } catch (e) {
    return "data inválida";
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getInitials(username) {
  const name = username ? String(username) : "AN";
  return name.slice(0, 2).toUpperCase();
}
