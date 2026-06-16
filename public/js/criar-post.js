if (!requireAuth("/home.html")) {
  throw new Error("auth required");
}

const urlParams = new URLSearchParams(window.location.search);
const editPostId = urlParams.get("edit");

const spotifySearch = initSpotifySearch({
  inputId: "spotify-search",
  buttonId: "btn-search-spotify",
  resultsId: "spotify-results",
  hiddenUrlId: "post-spotify",
  selectedId: null,
  trackHiddenId: "post-spotify-track",
  variant: "card",
});

document.addEventListener("DOMContentLoaded", async () => {
  if (editPostId) {
    const formTitle = document.querySelector(".form-title");
    const submitBtn = document.querySelector("#btn-submit-post");

    if (formTitle) formTitle.textContent = "> EDIT_EXISTING_LOG.EXE";
    if (submitBtn) submitBtn.textContent = "> atualizar";

    try {
      const res = await fetch(`${API}/api/posts/${editPostId}`, {
        headers: authHeader(),
      });

      if (res.ok) {
        const post = await res.json();

        document.getElementById("post-title").value = post.title || "";
        document.getElementById("post-excerpt").value = post.excerpt || "";
        document.getElementById("post-category").value = post.category_id || "";
        document.getElementById("post-content").value = post.content || "";

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

const form = document.getElementById("form-criar-post");
const errorEl = document.getElementById("msg-erro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const title = document.getElementById("post-title").value.trim();
  const excerptInput = document.getElementById("post-excerpt").value.trim();
  const category_id = parseInt(
    document.getElementById("post-category").value,
    10,
  );
  const content = document.getElementById("post-content").value.trim();
  const spotify_url = document.getElementById("post-spotify").value;
  const spotify_track = document.getElementById("post-spotify-track").value;
  const status = "published";
  const excerpt =
    excerptInput ||
    (content.length > 120 ? content.slice(0, 117) + "..." : content);

  const urlEndpoint = editPostId
    ? `${API}/api/posts/${editPostId}`
    : `${API}/api/posts`;
  const httpMethod = editPostId ? "PUT" : "POST";

  try {
    const res = await fetch(urlEndpoint, {
      method: httpMethod,
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
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

    window.location.href = editPostId
      ? `/post.html?id=${editPostId}`
      : "/home.html";
  } catch (err) {
    errorEl.textContent = "Servidor central fora de alcance. Verifique a API.";
    console.error(err);
  }
});
