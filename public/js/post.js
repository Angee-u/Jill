const API = "http://localhost:3000";

// pega o id do post da URL: /post.html?id=3
const postId = new URLSearchParams(window.location.search).get("id");

if (!postId) window.location.href = "/home.html";

function getUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function checkAuthHeader() {
  const user = getUser();
  const headerAuth = document.getElementById("header-auth");

  if (user && headerAuth) {
    headerAuth.innerHTML = `[ session: <span>${user.username}</span> ]`;
    headerAuth.href = "#";
    headerAuth.style.color = "#00ffcc";

    headerAuth.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Deseja encerrar a sessão no terminal?")) {
        localStorage.clear();
        window.location.reload();
      }
    });
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "data desconhecida";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "data inválida";
  }
}

async function loadPost() {
  const container = document.getElementById("post-main");

  try {
    const res = await fetch(`${API}/api/posts/${postId}`);
    const post = await res.json();

    if (!res.ok) {
      container.innerHTML = '<p class="feed-loading">post não encontrado.</p>';
      return;
    }

    const postTitle = post.title || "Log Sem Título";
    document.title = `${postTitle} — JILL-11.BAR`;

    const username = post.username ? String(post.username) : "Anon_Bartender";
    const initials = username.slice(0, 2).toUpperCase();

    document.getElementById("author-avatar").textContent = initials;
    document.getElementById("author-name").textContent = username;
    document.getElementById("author-bio").textContent =
      post.bio || "sem bio ainda.";

    // VERIFICA DONO POST
    const user = getUser();
    const actionsContainer = document.getElementById("sidebar-actions");

    if (user && post && actionsContainer && user.id === post.user_id) {
      actionsContainer.innerHTML = `
        <a href="/criar-post.html?edit=${post.id}" class="sidebar-link edit-mode" style="margin-bottom: 8px; display: block;">> editar_log.exe</a>
        <button id="btn-deletar-log" class="sidebar-link del-mode" style="background: none; border: none; width: 100%; text-align: left; cursor: pointer; padding: 0; display: block; margin-bottom: 12px;">> deletar_log.exe</button>
      `;

      // Evento de clique para deletar o registro
      document
        .getElementById("btn-deletar-log")
        .addEventListener("click", async () => {
          if (
            confirm(
              "AVISO DE SEGURANÇA: Excluir este registro o apagará permanentemente do banco central do JILL-11.BAR. Confirmar comando?",
            )
          ) {
            try {
              const deleteRes = await fetch(`${API}/api/posts/${post.id}`, {
                method: "DELETE",
                headers: authHeader(),
              });

              if (deleteRes.ok) {
                alert("Registro deletado do terminal com sucesso.");
                window.location.href = "/home.html";
              } else {
                const errData = await deleteRes.json();
                alert(errData.error || "Erro ao deletar registro.");
              }
            } catch (err) {
              console.error(err);
              alert("Erro ao se conectar com o servidor central.");
            }
          }
        });
    }

    const categoriaExibida = post.category_name
      ? String(post.category_name).toLowerCase()
      : "sem categoria";

    // Spotify
    const spotifyHtml = post.spotify_url
      ? `<div class="post-spotify">
           <iframe
             src="https://open.spotify.com/embed/track/${extractSpotifyId(post.spotify_url)}?utm_source=generator&theme=0"
             width="100%" height="80" frameBorder="0"
             allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
             loading="lazy">
           </iframe>
         </div>`
      : "";

    container.innerHTML = `
      <div class="post-breadcrumb">
        <a href="/home.html">home</a>
        <span>/</span>
        <span>${categoriaExibida}</span>
        <span>/</span>
        <span>${postTitle}</span>
      </div>

      <header class="post-header">
        <div class="post-meta">
          <span class="post-tag tag-other">${categoriaExibida}</span>
          <span class="post-date">${formatDate(post.created_at)}</span>
        </div>
        <h1 class="post-header-title">${postTitle}</h1>
        <div class="post-header-author">
          <div class="author-avatar" style="width:2rem;height:2rem;font-size:0.4rem;display:flex;align-items:center;justify-content:center;">${initials}</div>
          <span>${username}</span>
        </div>
      </header>

      ${spotifyHtml}

      <div class="post-body">
        ${
          post.content
            ? post.content
                .split("\n")
                .map((p) => (p.trim() ? `<p>${p}</p>` : ""))
                .join("")
            : "<p>Sem conteúdo.</p>"
        }
      </div>

      <div class="post-divider"></div>

      <section class="comments-section" id="comments-section">
      </section>
    `;

    checkAuthHeader();
    loadComments();
  } catch (err) {
    container.innerHTML = '<p class="feed-loading">erro ao carregar post.</p>';
    console.error(err);
  }
}

// Dados pro Spotify
function extractSpotifyId(url) {
  if (!url) return "";
  const parts = url.split("/");
  return parts[parts.length - 1].split("?")[0];
}

// COMENTSS
async function loadComments() {
  const section = document.getElementById("comments-section");
  const user = getUser();

  try {
    const res = await fetch(`${API}/api/posts/${postId}/comments`);
    const data = await res.json();

    const comments = data.comments || (Array.isArray(data) ? data : []);

    const formHtml = user
      ? `<div class="comment-form-box">
           <p class="comment-form-title">// deixar um comentário</p>
           <div class="va-input-group">
             <textarea id="new-comment" class="va-input" rows="3" placeholder="escreva aqui..." style="width:100%; background:var(--va-bg-main); border:1px solid var(--va-bg-rain); color:var(--va-text-main); font-family:var(--font-interface); padding:8px; resize:vertical;"></textarea>
           </div>
           <div class="comment-form-actions">
             <button class="va-btn" id="btn-comment-submit">comentar ></button>
           </div>
         </div>`
      : `<div class="comment-form-box">
           <p class="comment-form-guest">
             <a href="/login.html">entre</a> para deixar um comentário.
           </p>
         </div>`;

    const listHtml =
      comments.length === 0
        ? '<p class="comments-empty">nenhum comentário ainda. seja o primeiro.</p>'
        : `<div class="comments-list">${comments.map((c) => buildCommentCard(c, user)).join("")}</div>`;

    section.innerHTML = `
      <p class="section-title" style="font-family:var(--font-interface); font-size:1.6rem; color:var(--va-neon-pink); border-bottom:1px solid var(--va-bg-rain); padding-bottom:6px; margin-bottom:1rem;">// comentários</p>
      <p class="comments-count">${comments.length} comentário${comments.length !== 1 ? "s" : ""}</p>
      ${formHtml}
      ${listHtml}
    `;

    // evento do botão de comentar
    const btnSubmit = document.getElementById("btn-comment-submit");
    if (btnSubmit) {
      btnSubmit.addEventListener("click", submitComment);
    }

    // eventos de editar/deletar
    attachCommentEvents();
  } catch (err) {
    console.error(err);
  }
}

// CARD DE COMMENT
function buildCommentCard(comment, user) {
  const isOwn = user && user.id === comment.user_id;
  const username = comment.username ? String(comment.username) : "Anon";
  const initials = username.slice(0, 2).toUpperCase();

  const actions = isOwn
    ? `<div class="comment-actions">
         <button class="comment-action-btn" data-id="${comment.id}" data-action="edit">editar</button>
         <button class="comment-action-btn del" data-id="${comment.id}" data-action="delete">del</button>
       </div>`
    : "";

  return `
    <div class="comment-card ${isOwn ? "own" : ""}" id="comment-${comment.id}">
      <div class="comment-header">
        <div class="comment-author">
          <div class="author-avatar" style="width:2rem;height:2rem;font-size:0.4rem;display:flex;align-items:center;justify-content:center;">${initials}</div>
          <span class="author-name">${username}</span>
          <span class="comment-date">${formatDate(comment.created_at)}</span>
        </div>
        ${actions}
      </div>
      <p class="comment-content" id="comment-content-${comment.id}">${comment.content}</p>
    </div>
  `;
}

// EDITAR / DELETAR
function attachCommentEvents() {
  document.querySelectorAll(".comment-action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      if (action === "edit") startEditComment(id);
      if (action === "delete") deleteComment(id);
    });
  });
}

// ADD COMMENT
async function submitComment() {
  const textarea = document.getElementById("new-comment");
  const content = textarea.value.trim();

  if (!content) return;

  try {
    const res = await fetch(`${API}/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "erro ao comentar.");
      return;
    }

    textarea.value = "";
    loadComments();
  } catch (err) {
    console.error(err);
  }
}

// EDITAR COMMENT
function startEditComment(id) {
  const contentEl = document.getElementById(`comment-content-${id}`);
  const original = contentEl.textContent;

  contentEl.outerHTML = `
    <div class="comment-edit-form" id="edit-form-${id}">
      <textarea class="va-input" id="edit-textarea-${id}" rows="3" style="width:100%; background:var(--va-bg-main); border:1px solid var(--va-bg-rain); color:var(--va-text-main); font-family:var(--font-interface); padding:8px; resize:vertical;">${original}</textarea>
      <div class="comment-form-actions">
        <button class="va-btn" data-id="${id}" data-action="save-edit" style="margin-right:6px;">salvar</button>
        <button class="va-btn pink" data-id="${id}" data-action="cancel-edit">cancelar</button>
      </div>
    </div>
  `;

  document
    .querySelector(`[data-action="save-edit"][data-id="${id}"]`)
    .addEventListener("click", () => saveEditComment(id, original));

  document
    .querySelector(`[data-action="cancel-edit"][data-id="${id}"]`)
    .addEventListener("click", () => loadComments());
}

async function saveEditComment(id, original) {
  const content = document.getElementById(`edit-textarea-${id}`).value.trim();

  if (!content) return;
  if (content === original) {
    loadComments();
    return;
  }

  try {
    const res = await fetch(`${API}/api/posts/${postId}/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "erro ao editar.");
      return;
    }

    loadComments();
  } catch (err) {
    console.error(err);
  }
}

// DELETAR COMMENT
async function deleteComment(id) {
  if (!confirm("deletar comentário?")) return;

  try {
    const res = await fetch(`${API}/api/posts/${postId}/comments/${id}`, {
      method: "DELETE",
      headers: { ...authHeader() },
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "erro ao deletar.");
      return;
    }

    loadComments();
  } catch (err) {
    console.error(err);
  }
}

loadPost();
