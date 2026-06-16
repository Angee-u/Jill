let currentPage = 1;
let currentCategory = "";

function buildPostCard(post) {
  const accents = ["", "accent-pink", "accent-teal", "accent-amber"];
  const accent = accents[post.id % accents.length];

  const temMusica = post.spotify_url && post.spotify_url.trim() !== "";
  const nomeMusica = post.spotify_track || "Neon District";
  const spotify = temMusica
    ? `<div class="spotify-bar">
         <span class="spotify-dot"></span>
         <span class="spotify-track">• tocando: ${escapeHtml(nomeMusica)}</span>
       </div>`
    : "";

  const textoResumo =
    post.excerpt ||
    (temMusica
      ? "Transmissão de áudio síncrona interceptada."
      : "Sem conteúdo adicional...");

  const username = post.username ? String(post.username) : "Anon_Bartender";
  const initials = getInitials(username);

  const categoriaExibida =
    post.category_name && post.category_name !== "null"
      ? String(post.category_name).toLowerCase()
      : "sem categoria";

  return `
    <article class="post-card ${accent}">
      <div class="post-meta">
        <span class="post-tag">${escapeHtml(categoriaExibida)}</span>
        <span class="post-date">${formatDate(post.created_at)}</span>
      </div>
      <h2 class="post-title">
        <a href="/post.html?id=${post.id}">${escapeHtml(post.title)}</a>
      </h2>
      <p class="post-excerpt">${escapeHtml(textoResumo)}</p>
      <div class="post-footer">
        <div class="post-author">
          <div class="author-avatar">${initials}</div>
          <span class="author-name">${escapeHtml(username)}</span>
        </div>
        ${spotify}
      </div>
    </article>
  `;
}

async function loadPosts(category = "", page = 1) {
  const container = document.getElementById("posts-container");
  const pagination = document.getElementById("feed-pagination");

  if (container) {
    container.innerHTML = '<p class="feed-loading">carregando logs...</p>';
  }
  if (pagination) pagination.innerHTML = "";

  let url = `${API}/api/posts?page=${page}&limit=5`;
  if (category) url += `&category=${category}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const postsList = data.posts || (Array.isArray(data) ? data : []);

    if (postsList.length === 0) {
      container.innerHTML =
        '<p class="feed-empty">nenhum post ainda. seja o primeiro.</p>';
      return;
    }

    container.innerHTML = postsList.map(buildPostCard).join("");

    if (data.pagination && data.pagination.totalPages > 1 && pagination) {
      for (let i = 1; i <= data.pagination.totalPages; i++) {
        const btn = document.createElement("button");
        btn.className = `page-btn ${i === page ? "active" : ""}`;
        btn.textContent = i;
        btn.addEventListener("click", () => {
          currentPage = i;
          loadPosts(currentCategory, i);
        });
        pagination.appendChild(btn);
      }
    }

    const totalPosts = data.pagination
      ? data.pagination.total
      : postsList.length;
    const statPostsEl = document.getElementById("stat-posts");
    if (statPostsEl) statPostsEl.textContent = totalPosts;

    const statUsers = document.getElementById("stat-users");
    if (statUsers) {
      const uniqueAuthors = new Set(
        postsList.map((p) => p.username || p.user_id),
      );
      statUsers.textContent = uniqueAuthors.size || 1;
    }
  } catch (err) {
    if (container) {
      container.innerHTML =
        '<p class="feed-empty">erro ao carregar posts.</p>';
    }
    console.error(err);
  }
}

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.category || "";
    currentPage = 1;
    loadPosts(currentCategory, 1);
  });
});

document.querySelectorAll(".sidebar-link[data-category]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document
      .querySelectorAll(".sidebar-link")
      .forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    currentCategory = link.dataset.category || "";
    currentPage = 1;
    loadPosts(currentCategory, 1);

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle(
        "active",
        (btn.dataset.category || "") === currentCategory,
      );
    });
  });
});

loadPosts();
