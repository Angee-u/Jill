const API = 'http://localhost:3000';

let currentPage     = 1;
let currentCategory = '';

// FORMATA A DATA 
function formatDate(dateStr) {
  if (!dateStr) return 'data desconhecida';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'short',
      day:      '2-digit',
      month:    '2-digit',
      hour:     '2-digit',
      minute:   '2-digit'
    });
  } catch (e) {
    return 'data inválida';
  }
}

// Criar POSTCARD
function buildPostCard(post) {
  // 1. Estilização dinâmica
  const accents = ['', 'accent-pink', 'accent-teal', 'accent-amber'];
  const accent = accents[post.id % accents.length];

  // 2. Lógica de Spotify
  const temMusica = post.spotify_url && post.spotify_url.trim() !== '';
  const spotify = temMusica
    ? `<div class="spotify-bar">
         <span class="spotify-dot"></span>
         <span class="spotify-track">• tocando: ${post.excerpt || 'Neon District'}</span>
       </div>`
    : '';

  const textoResumo = temMusica 
    ? 'Transmissão de áudio síncrona interceptada.' 
    : (post.excerpt || 'Sem conteúdo adicional...');

  // 3. Tratamento do Usuário
  const username = post.username ? String(post.username) : 'Anon_Bartender';
  const initials = username.slice(0, 2).toUpperCase();

  // 4. CORREÇÃO DA CATEGORIA
  // Adicionei um console.log para você ver o que está chegando na aba "Console" do F12
  console.log("Debug Categoria Post:", post.id, post.category_name);

  // Força minúsculas e trata nulos
  const categoriaExibida = (post.category_name && post.category_name !== 'null') 
                           ? String(post.category_name).toLowerCase() 
                           : 'sem categoria';

  return `
    <article class="post-card ${accent}">
      <div class="post-meta">
        <span class="post-tag">${categoriaExibida}</span>
        <span class="post-date">${formatDate(post.created_at)}</span>
      </div>
      <h2 class="post-title">
        <a href="/post.html?id=${post.id}">${post.title}</a>
      </h2>
      <p class="post-excerpt">${textoResumo}</p>
      <div class="post-footer">
        <div class="post-author">
          <div class="author-avatar">${initials}</div>
          <span class="author-name">${username}</span>
        </div>
        ${spotify}
      </div>
    </article>
  `;
}

// CARREGA POSTS (se tiver)
async function loadPosts(category = '', page = 1) {
  const container = document.getElementById('posts-container');
  const pagination = document.getElementById('feed-pagination');
  
  if (container) container.innerHTML = '<p class="feed-loading">carregando logs...</p>';
  if (pagination) pagination.innerHTML = '';

  let url = `${API}/api/posts?page=${page}&limit=5`;
  if (category) url += `&category=${category}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();

    const postsList = data.posts || (Array.isArray(data) ? data : []);

    if (postsList.length === 0) {
      container.innerHTML = '<p class="feed-empty">nenhum post ainda. seja o primeiro.</p>';
      return;
    }

    container.innerHTML = postsList.map(buildPostCard).join('');

    // PAGINAÇÃO
    if (data.pagination && data.pagination.totalPages > 1 && pagination) {
      for (let i = 1; i <= data.pagination.totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === page ? 'active' : ''}`;
        btn.textContent = i;
        btn.addEventListener('click', () => {
          currentPage = i;
          loadPosts(currentCategory, i);
        });
        pagination.appendChild(btn);
      }
    }

    // ATUALIZA OS STATUS DA HERO
    const totalPosts = data.pagination ? data.pagination.total : postsList.length;
    const statPostsEl = document.getElementById('stat-posts');
    if (statPostsEl) statPostsEl.textContent = totalPosts;

    const statUsers = document.getElementById('stat-users');
    if (statUsers) {
      const uniqueAuthors = new Set(postsList.map(p => p.username || p.user_id));
      statUsers.textContent = uniqueAuthors.size || 1;
    }

  } catch (err) {
    if (container) container.innerHTML = '<p class="feed-empty">erro ao carregar posts.</p>';
    console.error(err);
  }
}

// ALTERAR A SESSÃO (Logar, deslogar)
function checkAuthHeader() {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  const headerAuth = document.getElementById('header-auth');

  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      if (headerAuth) {
        headerAuth.innerHTML = `
          <a href="/criar-post.html" class="nav-link" style="margin-right: 1.5rem; display: inline-block;">[ + criar log ]</a>
          [ session: <span>${user.username}</span> ]
        `;
        headerAuth.href = '#';
        headerAuth.classList.add('active');
        
        headerAuth.querySelector('span').addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm('Deseja encerrar a sessão no terminal?')) {
            localStorage.clear();
            window.location.reload();
          }
        });
      }
    } catch (e) {
      console.error("Erro ao processar dados de autenticação:", e);
    }
  }
}

// FILTROS DAS CATEGORIAS
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category || '';
    currentPage     = 1;
    loadPosts(currentCategory, 1);
  });
});

document.querySelectorAll('.sidebar-link[data-category]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    currentCategory = link.dataset.category || '';
    currentPage     = 1;
    loadPosts(currentCategory, 1);

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.category || '') === currentCategory);
    });
  });
});

// Chamando as funções
checkAuthHeader();
loadPosts();