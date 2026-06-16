const postId = new URLSearchParams(window.location.search).get("id");

if (!postId) window.location.href = "/home.html";

function extractSpotifyId(url) {
  if (!url) return "";
  const parts = url.split("/");
  return parts[parts.length - 1].split("?")[0];
}

async function loadPost() {
  const container = document.getElementById("post-main");

  try {
    const res = await fetch(`${API}/api/posts/${postId}`, {
      headers: authHeader(),
    });
    const post = await res.json();

    if (!res.ok) {
      container.innerHTML = '<p class="feed-loading">post não encontrado.</p>';
      return;
    }

    const postTitle = post.title || "Log Sem Título";
    document.title = `${postTitle} — JILL-11.BAR`;

    const username = post.username ? String(post.username) : "Anon_Bartender";
    const initials = getInitials(username);

    document.getElementById("author-avatar").textContent = initials;
    document.getElementById("author-name").textContent = username;
    document.getElementById("author-bio").textContent =
      post.bio || "sem bio ainda.";

    const user = getUser();
    const actionsContainer = document.getElementById("sidebar-actions");

    if (user && post && actionsContainer && user.id === post.user_id) {
      actionsContainer.innerHTML = `
        <a href="/criar-post.html?edit=${post.id}" class="sidebar-link sidebar-link--action">> editar_log.exe</a>
        <button type="button" id="btn-deletar-log" class="sidebar-link sidebar-link--action sidebar-link--danger">> deletar_log.exe</button>
      `;

      document
        .getElementById("btn-deletar-log")
        .addEventListener("click", async () => {
          if (
            confirm(
              "AVISO: Excluir este registro o apagará permanentemente do banco central do JILL-11.BAR. Você confirma??",
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
        <span>${escapeHtml(categoriaExibida)}</span>
        <span>/</span>
        <span>${escapeHtml(postTitle)}</span>
      </div>

      <header class="post-header">
        <div class="post-meta">
          <span class="post-tag tag-other">${escapeHtml(categoriaExibida)}</span>
          <span class="post-date">${formatDate(post.created_at)}</span>
        </div>
        <h1 class="post-header-title">${escapeHtml(postTitle)}</h1>
        <div class="post-header-author">
          <div class="author-avatar author-avatar--sm">${initials}</div>
          <span>${escapeHtml(username)}</span>
        </div>
      </header>

      ${spotifyHtml}

      <div class="post-body">
        ${
          post.content
            ? post.content
                .split("\n")
                .map((p) => (p.trim() ? `<p>${escapeHtml(p)}</p>` : ""))
                .join("")
            : "<p>Sem conteúdo.</p>"
        }
      </div>

      <div class="post-divider"></div>

      <section class="comments-section" id="comments-section"></section>
    `;

    loadComments();
  } catch (err) {
    container.innerHTML = '<p class="feed-loading">erro ao carregar post.</p>';
    console.error(err);
  }
}

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
             <textarea id="new-comment" class="va-input" rows="3" placeholder="escreva aqui..."></textarea>
           </div>
           <div class="comment-form-actions">
             <button type="button" class="va-btn" id="btn-comment-submit">comentar ></button>
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
      <p class="section-title">// comentários</p>
      <p class="comments-count">${comments.length} comentário${comments.length !== 1 ? "s" : ""}</p>
      ${formHtml}
      ${listHtml}
    `;

    const btnSubmit = document.getElementById("btn-comment-submit");
    if (btnSubmit) {
      btnSubmit.addEventListener("click", submitComment);
    }

    attachCommentEvents();
  } catch (err) {
    console.error(err);
  }
}

function buildCommentCard(comment, user) {
  const isOwn = user && user.id === comment.user_id;
  const username = comment.username ? String(comment.username) : "Anon";
  const initials = getInitials(username);

  const actions = isOwn
    ? `<div class="comment-actions">
         <button type="button" class="comment-action-btn" data-id="${comment.id}" data-action="edit">editar</button>
         <button type="button" class="comment-action-btn del" data-id="${comment.id}" data-action="delete">del</button>
       </div>`
    : "";

  return `
    <div class="comment-card ${isOwn ? "own" : ""}" id="comment-${comment.id}">
      <div class="comment-header">
        <div class="comment-author">
          <div class="author-avatar author-avatar--sm">${initials}</div>
          <span class="author-name">${escapeHtml(username)}</span>
          <span class="comment-date">${formatDate(comment.created_at)}</span>
        </div>
        ${actions}
      </div>
      <p class="comment-content" id="comment-content-${comment.id}">${escapeHtml(comment.content)}</p>
    </div>
  `;
}

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

function startEditComment(id) {
  const contentEl = document.getElementById(`comment-content-${id}`);
  const original = contentEl.textContent;

  contentEl.outerHTML = `
    <div class="comment-edit-form" id="edit-form-${id}">
      <textarea class="va-input" id="edit-textarea-${id}" rows="3">${escapeHtml(original)}</textarea>
      <div class="comment-form-actions">
        <button type="button" class="va-btn" data-id="${id}" data-action="save-edit">salvar</button>
        <button type="button" class="va-btn pink" data-id="${id}" data-action="cancel-edit">cancelar</button>
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

async function deleteComment(id) {
  if (!confirm("deletar comentário?")) return;

  try {
    const res = await fetch(`${API}/api/posts/${postId}/comments/${id}`, {
      method: "DELETE",
      headers: authHeader(),
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
