function saveToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}

function isLoggedIn() {
  return !!getToken();
}

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function updateHeaderAuth() {
  const user = getUser();
  const authLink = document.getElementById("header-auth");
  const createLink = document.getElementById("header-create");
  const logoutBtn = document.getElementById("btn-logout");
  const usernameEl = document.getElementById("header-username");

  if (usernameEl) {
    usernameEl.textContent = user ? `[ ${user.username} ]` : "";
  }

  if (authLink) {
    if (user) {
      authLink.textContent = `[ ${user.username} ]`;
      authLink.href = "/listagem.html";
    } else {
      authLink.textContent = "[ entrar ]";
      authLink.href = "/login.html";
    }
  }

  if (createLink) {
    createLink.classList.toggle("hide", !user);
  }

  if (logoutBtn) {
    logoutBtn.classList.toggle("hide", !user);
  }
}

function requireAuth(redirectTo = "/login.html") {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  updateHeaderAuth();

  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Encerrar sessão no JILL-11.BAR?")) {
        logout();
      }
    });
  }
});
