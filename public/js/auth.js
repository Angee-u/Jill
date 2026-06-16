function saveToken(token) {
  localStorage.setItem('jill_token', token);
}

function getToken() {
  return localStorage.getItem('jill_token');
}

function getUser() {
  const user = localStorage.getItem('jill_user');
  return user ? JSON.parse(user) : null;
}

function saveUser(user) {
  localStorage.setItem('jill_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('jill_token');
  localStorage.removeItem('jill_user');
  window.location.href = '/login.html';
}

function isLoggedIn() {
  return !!getToken();
}

// Header para as autorizações, ler o documento
function authHeader() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function updateHeaderAuth() {
  const authLink = document.getElementById('header-auth');
  const logoutBtn = document.getElementById('btn-logout');
  const user = getUser();

  if (user) {
    // Se logado: mostra o nome e o botão de sair
    authLink.textContent = `[ ${user.username} ]`;
    authLink.href = '/listagem.html';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    // Se não logado: mostra "entrar" e esconde o botão de sair
    authLink.textContent = '[ entrar ]';
    authLink.href = '/login.html';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
}

// Funcionalidade para sair
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderAuth();
  
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Encerrar sessão no JILL-11.BAR?')) {
        logout();
      }
    });
  }
});

// Recarrega
document.addEventListener('DOMContentLoaded', updateHeaderAuth);
