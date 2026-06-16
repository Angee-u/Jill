const API = "http://localhost:3000";

const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

const urlParams = new URLSearchParams(window.location.search);
const rawEditId = urlParams.get("edit");
const editPostId = rawEditId ? rawEditId.split(":")[0] : null;

if (!token || !userData) {
  alert(
    "Acesso negado. Interface de transmissão síncrona restrita a funcionários.",
  );
  window.location.href = "/home.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = JSON.parse(userData);
    const headerAuth = document.getElementById("header-auth");
    if (headerAuth) {
      headerAuth.innerHTML = `[ session: <span>${user.username}</span> ]`;
      headerAuth.href = "#";
    }
  } catch (err) {
    console.error("Falha ao recuperar sessão local:", err);
  }

  if (editPostId) {
    const formTitle = document.querySelector(".form-title");
    const submitBtn = document.querySelector(".va-btn");

    if (formTitle) formTitle.textContent = "> EDIT_EXISTING_LOG.EXE";
    if (submitBtn) submitBtn.textContent = "> atualizar";

    try {
      const res = await fetch(`${API}/api/posts/${editPostId}`);
      if (res.ok) {
        const post = await res.json();

        // Pega os dados do banco
        document.getElementById("post-title").value = post.title || "";
        document.getElementById("post-category").value = post.category_id;
        document.getElementById("post-content").value = post.content || "";

        // Se já tem musga
        if (post.spotify_url) {
          document.getElementById("post-spotify").value = post.spotify_url;
          document.getElementById("post-spotify-track").value =
            post.spotify_track || "";
          document.getElementById("spotify-search").value =
            post.spotify_track || "";
        }
      }
    } catch (err) {
      console.error("Erro ao carregar dados do log para edição:", err);
    }
  }
});

// API DO SPOTIFY
const btnSearch = document.getElementById("btn-search-spotify");
const inputSearch = document.getElementById("spotify-search");
const resultsContainer = document.getElementById("spotify-results");

btnSearch.addEventListener("click", async () => {
  const query = inputSearch.value.trim();
  if (!query) return;

  resultsContainer.innerHTML =
    '<p class="va-error" style="padding: 10px;">Buscando faixas no catálogo...</p>';

  try {
    const res = await fetch(
      `${API}/api/spotify/search?q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const data = await res.json();
    const tracks = data.tracks || [];

    if (tracks.length === 0) {
      resultsContainer.innerHTML =
        '<p class="va-error" style="padding: 10px;">Nenhuma música encontrada.</p>';
      return;
    }

    resultsContainer.innerHTML = tracks
      .map(
        (track) => `
      <div class="spotify-track-card" data-url="${track.spotify_url}" data-title="${track.name} - ${track.artist}">
        <img src="${track.cover || ""}" class="spotify-track-cover" alt="Cover" />
        <div class="spotify-track-info">
          <span class="spotify-track-name">${track.name}</span>
          <span class="spotify-track-artist">${track.artist}</span>
        </div>
      </div>
    `,
      )
      .join("");

    document.querySelectorAll(".spotify-track-card").forEach((card) => {
      card.addEventListener("click", () => {
        document
          .querySelectorAll(".spotify-track-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        document.getElementById("post-spotify").value = card.dataset.url;
        document.getElementById("post-spotify-track").value =
          card.dataset.title;
      });
    });
  } catch (err) {
    resultsContainer.innerHTML =
      '<p class="va-error" style="padding: 10px;">Erro ao conectar com o serviço musical.</p>';
    console.error(err);
  }
});

const form = document.getElementById("form-criar-post");
const errorEl = document.getElementById("msg-erro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const title = document.getElementById("post-title").value.trim();
  const category_id = parseInt(
    document.getElementById("post-category").value,
    10,
  );
  const content = document.getElementById("post-content").value.trim();

  const spotify_url = document.getElementById("post-spotify").value;
  const spotify_track = document.getElementById("post-spotify-track").value;

  const status = "published";
  const excerpt =
    content.length > 120 ? content.slice(0, 117) + "..." : content;

  const urlEndpoint = editPostId
    ? `${API}/api/posts/${editPostId}`
    : `${API}/api/posts`;
  const httpMethod = editPostId ? "PUT" : "POST";

  try {
    const res = await fetch(urlEndpoint, {
      method: httpMethod,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
        excerpt,
        category_id,
        spotify_url,
        spotify_track,
        status,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent =
        data.error || "Falha crítica ao processar publicação.";
      return;
    }

    // Alterando a página, depende se criou ou editou
    window.location.href = editPostId
      ? `/post.html?id=${editPostId}`
      : "/home.html";
  } catch (err) {
    errorEl.textContent = "Servidor central fora de alcance. Verifique a API.";
    console.error(err);
  }
});
