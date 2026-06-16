if (!requireAuth()) {
  throw new Error("auth required");
}

let editingId = null;
let deleteTargetId = null;

const spotifySearch = initSpotifySearch({
  inputId: "post-spotify-search",
  buttonId: "btn-spotify-search",
  resultsId: "spotify-results",
  hiddenUrlId: "post-spotify-url",
  selectedId: "spotify-selected",
  trackHiddenId: "post-spotify-track",
});

async function loadMyPosts() {
  const container = document.getElementById("posts-table-container");
  const filterStatus = document.getElementById("filter-status").value;

  container.innerHTML = '<p class="feed-loading">carregando posts...</p>';

  let url = `${API}/api/posts/mine`;
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
              <td class="td-title" title="${escapeHtml(post.title)}">${escapeHtml(post.title)}</td>
              <td><span class="post-tag tag-other">${escapeHtml(post.category_name || "—")}</span></td>
              <td>${formatDate(post.created_at, "short")}</td>
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

function fillForm(post) {
  editingId = post.id;

  document.getElementById("post-id").value = post.id;
  document.getElementById("post-title").value = post.title;
  document.getElementById("post-excerpt").value = post.excerpt || "";
  document.getElementById("post-content").value = post.content;
  document.getElementById("post-category").value = post.category_id || "";
  document.getElementById("post-spotify-url").value = post.spotify_url || "";
  document.getElementById("post-spotify-track").value = post.spotify_track || "";

  document.querySelector(
    `input[name="post-status"][value="${post.status}"]`,
  ).checked = true;

  if (post.spotify_url) {
    spotifySearch.showSelected(post.spotify_track || "faixa selecionada");
  }

  document.getElementById("form-title").textContent = "// editar post";
  document.getElementById("btn-submit").textContent = "salvar alterações";
  document.getElementById("btn-cancel-edit").classList.remove("hide");

  document
    .querySelector(".form-panel")
    .scrollTo({ top: 0, behavior: "smooth" });

  clearFormMessages();
}

function resetForm() {
  editingId = null;

  document.getElementById("post-form").reset();
  document.getElementById("post-id").value = "";
  document.getElementById("post-spotify-url").value = "";
  document.getElementById("post-spotify-track").value = "";
  document.getElementById("spotify-selected").classList.add("hide");
  document.getElementById("spotify-selected").innerHTML = "";
  document.getElementById("spotify-results").classList.add("hide");
  document.getElementById("form-title").textContent = "// novo post";
  document.getElementById("btn-submit").textContent = "salvar post";
  document.getElementById("btn-cancel-edit").classList.add("hide");

  clearFormMessages();
}

function clearFormMessages() {
  document.getElementById("form-error").textContent = "";
  document.getElementById("form-success").textContent = "";
}

document.getElementById("btn-cancel-edit").addEventListener("click", resetForm);

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
  const spotifyTrack =
    document.getElementById("post-spotify-track").value || null;
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
    spotify_track: spotifyTrack,
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

document
  .getElementById("filter-status")
  .addEventListener("change", loadMyPosts);

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

document.getElementById("modal-delete").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeDeleteModal();
});

loadMyPosts();
