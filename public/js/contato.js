document.getElementById("contato-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("contato-nome").value.trim();
  const email = document.getElementById("contato-email").value.trim();
  const assunto = document.getElementById("contato-assunto").value.trim();
  const msg = document.getElementById("contato-msg").value.trim();
  const errorEl = document.getElementById("contato-error");
  const successEl = document.getElementById("contato-success");

  errorEl.textContent = "";
  successEl.textContent = "";

  if (!nome || !email || !assunto || !msg) {
    errorEl.textContent = "preencha todos os campos.";
    return;
  }

  const corpo = `De: ${nome} (${email})\n\n${msg}`;
  const mailto = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;

  window.location.href = mailto;
  successEl.textContent = "abrindo seu cliente de e-mail...";
});
