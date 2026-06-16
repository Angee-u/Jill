const API = 'http://localhost:3000';

function saveToken(token) {
  localStorage.setItem('token', token);
}

function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

 Oskar_getToken = () => localStorage.getItem('token');

function isLoggedIn() {
  // Retorna true se houver um token salvo, senão false
  return !!localStorage.getItem('token');
}

// Redireciona imediatamente para a home se o usuário já estiver logado
if (isLoggedIn()) {
  window.location.href = '/';
}

// TROCA DE ABAS (login / cadastro)
const btnLogin  = document.querySelectorAll('.btn-logsig')[0];
const btnSignUp = document.querySelectorAll('.btn-logsig')[1];
const formLogin  = document.getElementById('va-login-form');
const formSignUp = document.getElementById('va-signUp-form');

btnLogin.addEventListener('click', () => {
  btnLogin.classList.add('active');
  btnSignUp.classList.remove('active');
  formLogin.classList.remove('hide');
  formSignUp.classList.add('hide');
});

btnSignUp.addEventListener('click', () => {
  btnSignUp.classList.add('active');
  btnLogin.classList.remove('active');
  formSignUp.classList.remove('hide');
  formLogin.classList.add('hide');
});

// lOGIN
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = formLogin.querySelector('.va-error');
  const successEl = formLogin.querySelector('.va-success');

  // Limpa mensagens antigas
  if (errorEl) errorEl.textContent = '';
  if (successEl) successEl.textContent = '';

  if (!username || !password) {
    if (errorEl) errorEl.textContent = 'preencha todos os campos.';
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      if (errorEl) errorEl.textContent = data.error || 'erro ao fazer login.';
      return;
    }

    // Sucesso: Salva os dados no navegador - IMPORTANTE
    saveToken(data.token);
    saveUser(data.user);
    
    window.location.href = '/';

  } catch (err) {
    if (errorEl) errorEl.textContent = 'erro de conexão com o servidor.';
    console.error(err);
  }
});

// CADASTRO
formSignUp.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;
  const email    = document.getElementById('new-email').value.trim();
  const errorEl  = formSignUp.querySelector('.va-error');

  // Limpa mensagens antigas
  if (errorEl) errorEl.textContent = '';

  if (!username || !password || !email) {
    if (errorEl) errorEl.textContent = 'preencha todos os campos.';
    return;
  }

  if (password.length < 6) {
    if (errorEl) errorEl.textContent = 'senha deve ter ao menos 6 caracteres.';
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password, email })
    });

    const data = await res.json();

    if (!res.ok) {
      if (errorEl) errorEl.textContent = data.error || 'erro ao criar conta.';
      return;
    }

    btnLogin.click();
    
    const loginErrorEl = formLogin.querySelector('.va-error');
    const loginSuccessEl = formLogin.querySelector('.va-success');
    
    if (loginErrorEl) loginErrorEl.textContent = '';
    if (loginSuccessEl) loginSuccessEl.textContent = 'conta criada! faça login.';

  } catch (err) {
    if (errorEl) errorEl.textContent = 'erro de conexão com o servidor.';
    console.error(err);
  }
});