// listagem.js
const API = "http://localhost:3000";

// redireciona se não estiver logado
if (!isLoggedIn()) window.location.href = "/login.html";

const user = getUser();
if (user) {
  document.getElementById("header-username").textContent =
    `[ ${user.username} ]`;
}

document.getElementById("btn-logout").addEventListener("click", logout);

// ESTADO
let editingId = null; // id do post sendo editado (null = criando novo)
let deleteTargetId = null; // id do post aguardando confirmação de delete

// FORMATA DATA
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// CARREGA POSTS DO USUÁRIO
async function loadMyPosts() {
  const container = document.getElementById("posts-table-container");
  const filterStatus = document.getElementById("filter-status").value;

  container.innerHTML = '<p class="feed-loading">carregando posts...</p>';

  let url = `${API}/api/posts/mine`; // rota que retorna só os posts do usuário logado
  if (filterStatus) url += `?status=${filterStatus}`;

  try {
    const res = await fetch(url, { headers: authHeader() });
    const data = await res.json();

    if (!res.ok) {
      container.innerHTML = `<p class="feed-loading">${data.error || "erro ao carregar."}</p>`;
      return;
    }

    const posts = data.posts || [];

    if (posts.length === 0) {
      container.innerHTML =
        '<p class="table-empty">nenhum post ainda. escreva o primeiro.</p>';
      return;
    }

    container.innerHTML = `
      <table class="posts-table">
        <thead>
          <tr>
            <th>#</th>
            <th>título</th>
            <th>categoria</th>
            <th>data</th>
            <th>status</th>
            <th>ações</th>
          </tr>
        </thead>
        <tbody>
          ${posts
            .map(
              (post, i) => `
            <tr>
              <td class="td-num">${String(i + 1).padStart(3, "0")}</td>
              <td class="td-title" title="${post.title}">${post.title}</td>
              <td><span class="post-tag tag-other">${post.category_name || "—"}</span></td>
              <td>${formatDate(post.created_at)}</td>
              <td>
                <span class="${post.status === "published" ? "badge-pub" : "badge-draft"}">
                  ${post.status === "published" ? "pub" : "draft"}
                </span>
              </td>
              <td class="td-actions">
                <button class="tbl-btn" data-id="${post.id}" data-action="edit">editar</button>
                <button class="tbl-btn del" data-id="${post.id}" data-action="delete">del</button>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;

    // eventos dos botões da tabela
    document.querySelectorAll(".tbl-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const action = btn.dataset.action;
        const post = posts.find((p) => p.id === id);

        if (action === "edit" && post) fillForm(post);
        if (action === "delete") openDeleteModal(id);
      });
    });
  } catch (err) {
    container.innerHTML = '<p class="feed-loading">erro de conexão.</p>';
    console.error(err);
  }
}

// PREENCHE O FORM PARA EDIÇÃO
function fillForm(post) {
  editingId = post.id;

  document.getElementById("post-id").value = post.id;
  document.getElementById("post-title").value = post.title;
  document.getElementById("post-excerpt").value = post.excerpt || "";
  document.getElementById("post-content").value = post.content;
  document.getElementById("post-category").value = post.category_id || "";
  document.getElementById("post-spotify-url").value = post.spotify_url || "";

  // status
  document.querySelector(
    `input[name="post-status"][value="${post.status}"]`,
  ).checked = true;

  // spotify selecionado
  if (post.spotify_url) {
    const selectedEl = document.getElementById("spotify-selected");
    selectedEl.classList.remove("hide");
    selectedEl.querySelector(".spotify-selected-name").textContent =
      post.spotify_url;
  }

  document.getElementById("form-title").textContent = "// editar post";
  document.getElementById("btn-submit").textContent = "salvar alterações";
  document.getElementById("btn-cancel-edit").style.display = "block";

  // sobe até o form
  document
    .querySelector(".form-panel")
    .scrollTo({ top: 0, behavior: "smooth" });

  clearFormMessages();
}

// LIMPA O FORM
function resetForm() {
  editingId = null;

  document.getElementById("post-form").reset();
  document.getElementById("post-id").value = "";
  document.getElementById("post-spotify-url").value = "";
  document.getElementById("spotify-selected").classList.add("hide");
  document.getElementById("spotify-results").classList.add("hide");
  document.getElementById("form-title").textContent = "// novo post";
  document.getElementById("btn-submit").textContent = "salvar post";
  document.getElementById("btn-cancel-edit").style.display = "none";

  clearFormMessages();
}

function clearFormMessages() {
  document.getElementById("form-error").textContent = "";
  document.getElementById("form-success").textContent = "";
}

document.getElementById("btn-cancel-edit").addEventListener("click", resetForm);

// SUBMIT DO FORM (criar ou editar)
document.getElementById("post-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const errorEl = document.getElementById("form-error");
  const successEl = document.getElementById("form-success");
  clearFormMessages();

  const title = document.getElementById("post-title").value.trim();
  const content = document.getElementById("post-content").value.trim();
  const excerpt = document.getElementById("post-excerpt").value.trim();
  const categoryId = document.getElementById("post-category").value || null;
  const spotifyUrl = document.getElementById("post-spotify-url").value || null;
  const status = document.querySelector(
    'input[name="post-status"]:checked',
  ).value;

  if (!title || !content) {
    errorEl.textContent = "título e conteúdo são obrigatórios.";
    return;
  }

  const body = {
    title,
    content,
    excerpt,
    category_id: categoryId,
    spotify_url: spotifyUrl,
    status,
  };

  try {
    const url = editingId
      ? `${API}/api/posts/${editingId}`
      : `${API}/api/posts`;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...authHeader() },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || "erro ao salvar post.";
      return;
    }

    successEl.textContent = editingId ? "post atualizado!" : "post criado!";
    resetForm();
    loadMyPosts();
  } catch (err) {
    errorEl.textContent = "erro de conexão.";
    console.error(err);
  }
});

// FILTRO DE STATUS
document
  .getElementById("filter-status")
  .addEventListener("change", loadMyPosts);

// MODAL DE DELETE
function openDeleteModal(id) {
  deleteTargetId = id;
  document.getElementById("modal-delete").classList.remove("hide");
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById("modal-delete").classList.add("hide");
}

document
  .getElementById("btn-cancel-delete")
  .addEventListener("click", closeDeleteModal);

document
  .getElementById("btn-confirm-delete")
  .addEventListener("click", async () => {
    if (!deleteTargetId) return;

    try {
      const res = await fetch(`${API}/api/posts/${deleteTargetId}`, {
        method: "DELETE",
        headers: authHeader(),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "erro ao deletar.");
        return;
      }

      closeDeleteModal();
      loadMyPosts();
    } catch (err) {
      console.error(err);
    }
  });

// fecha modal clicando fora
document.getElementById("modal-delete").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeDeleteModal();
});

// SPOTIFY SEARCH
document
  .getElementById("btn-spotify-search")
  .addEventListener("click", searchSpotify);

document
  .getElementById("post-spotify-search")
  .addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchSpotify();
    }
  });

async function searchSpotify() {
  const q = document.getElementById("post-spotify-search").value.trim();
  const resultsEl = document.getElementById("spotify-results");

  if (!q) return;

  resultsEl.classList.remove("hide");
  resultsEl.innerHTML =
    '<p style="padding:8px 10px;font-family:var(--font-interface);font-size:1.2rem;color:var(--va-text-muted);">buscando...</p>';

  try {
    const res = await fetch(
      `${API}/api/spotify/search?q=${encodeURIComponent(q)}`,
      {
        headers: authHeader(),
      },
    );
    const data = await res.json();

    if (!res.ok || !data.tracks || data.tracks.length === 0) {
      resultsEl.innerHTML =
        '<p style="padding:8px 10px;font-family:var(--font-interface);font-size:1.2rem;color:var(--va-text-muted);">nenhum resultado.</p>';
      return;
    }

    resultsEl.innerHTML = data.tracks
      .map(
        (track) => `
      <div class="spotify-result-item" data-url="${track.spotify_url}" data-name="${track.name} — ${track.artist}">
        ${track.cover ? `<img class="spotify-result-cover" src="${track.cover}" alt="${track.name}" />` : ""}
        <div class="spotify-result-info">
          <p class="spotify-result-name">${track.name}</p>
          <p class="spotify-result-artist">${track.artist}</p>
        </div>
      </div>
    `,
      )
      .join("");

    resultsEl.querySelectorAll(".spotify-result-item").forEach((item) => {
      item.addEventListener("click", () =>
        selectTrack(item.dataset.url, item.dataset.name),
      );
    });
  } catch (err) {
    resultsEl.innerHTML =
      '<p style="padding:8px 10px;font-size:1.2rem;color:var(--va-neon-pink);">erro ao buscar.</p>';
    console.error(err);
  }
}

function selectTrack(url, name) {
  document.getElementById("post-spotify-url").value = url;

  const selectedEl = document.getElementById("spotify-selected");
  selectedEl.classList.remove("hide");
  selectedEl.innerHTML = `
    <span class="spotify-dot" style="width:5px;height:5px;background:#1ED760;border-radius:50%;flex-shrink:0;"></span>
    <span class="spotify-selected-name">${name}</span>
    <button class="spotify-clear" id="btn-clear-spotify">✕</button>
  `;

  document.getElementById("btn-clear-spotify").addEventListener("click", () => {
    document.getElementById("post-spotify-url").value = "";
    selectedEl.classList.add("hide");
    selectedEl.innerHTML = "";
  });

  document.getElementById("spotify-results").classList.add("hide");
  document.getElementById("post-spotify-search").value = "";
}

loadMyPosts();
