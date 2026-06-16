if (isLoggedIn()) {
  window.location.href = "/";
}

const btnLogin = document.querySelectorAll(".btn-logsig")[0];
const btnSignUp = document.querySelectorAll(".btn-logsig")[1];
const formLogin = document.getElementById("va-login-form");
const formSignUp = document.getElementById("va-signUp-form");

btnLogin.addEventListener("click", () => {
  btnLogin.classList.add("active");
  btnSignUp.classList.remove("active");
  formLogin.classList.remove("hide");
  formSignUp.classList.add("hide");
});

btnSignUp.addEventListener("click", () => {
  btnSignUp.classList.add("active");
  btnLogin.classList.remove("active");
  formSignUp.classList.remove("hide");
  formLogin.classList.add("hide");
});

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("login-error");
  const successEl = document.getElementById("login-success");

  errorEl.textContent = "";
  successEl.textContent = "";

  if (!username || !password) {
    errorEl.textContent = "preencha todos os campos.";
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || "erro ao fazer login.";
      return;
    }

    saveToken(data.token);
    saveUser(data.user);
    window.location.href = "/";
  } catch (err) {
    errorEl.textContent = "erro de conexão com o servidor.";
    console.error(err);
  }
});

formSignUp.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("new-username").value.trim();
  const password = document.getElementById("new-password").value;
  const email = document.getElementById("new-email").value.trim();
  const errorEl = document.getElementById("signup-error");

  errorEl.textContent = "";

  if (!username || !password || !email) {
    errorEl.textContent = "preencha todos os campos.";
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = "senha deve ter ao menos 6 caracteres.";
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || "erro ao criar conta.";
      return;
    }

    btnLogin.click();
    document.getElementById("login-error").textContent = "";
    document.getElementById("login-success").textContent =
      "conta criada! faça login.";
  } catch (err) {
    errorEl.textContent = "erro de conexão com o servidor.";
    console.error(err);
  }
});
