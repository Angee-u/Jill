function renderSpotifyResultItem(track, variant = "list") {
  const name = escapeHtml(track.name);
  const artist = escapeHtml(track.artist);
  const trackLabel = `${name} — ${artist}`;
  const cover = track.cover
    ? `<img class="${variant === "card" ? "spotify-track-cover" : "spotify-result-cover"}" src="${track.cover}" alt="${name}" />`
    : "";

  if (variant === "card") {
    return `
      <div class="spotify-track-card" data-url="${escapeHtml(track.spotify_url)}" data-name="${trackLabel}">
        ${cover}
        <div class="spotify-track-info">
          <span class="spotify-track-name">${name}</span>
          <span class="spotify-track-artist">${artist}</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="spotify-result-item" data-url="${escapeHtml(track.spotify_url)}" data-name="${trackLabel}">
      ${cover}
      <div class="spotify-result-info">
        <p class="spotify-result-name">${name}</p>
        <p class="spotify-result-artist">${artist}</p>
      </div>
    </div>
  `;
}

function setSpotifyResultsMessage(container, message, type = "muted") {
  container.classList.remove("hide");
  container.innerHTML = `<p class="spotify-results-msg spotify-results-msg--${type}">${message}</p>`;
}

function initSpotifySearch({
  inputId,
  buttonId,
  resultsId,
  hiddenUrlId,
  selectedId,
  trackHiddenId,
  variant = "list",
}) {
  const input = document.getElementById(inputId);
  const button = document.getElementById(buttonId);
  const resultsEl = document.getElementById(resultsId);
  const hiddenUrlEl = document.getElementById(hiddenUrlId);
  const selectedEl = selectedId ? document.getElementById(selectedId) : null;
  const trackHiddenEl = trackHiddenId
    ? document.getElementById(trackHiddenId)
    : null;
  const itemSelector =
    variant === "card" ? ".spotify-track-card" : ".spotify-result-item";

  if (!input || !button || !resultsEl || !hiddenUrlEl) return;

  function clearCardSelection() {
    resultsEl.querySelectorAll(".spotify-track-card").forEach((card) => {
      card.classList.remove("selected");
    });
  }

  async function search() {
    const query = input.value.trim();
    if (!query) return;

    setSpotifyResultsMessage(resultsEl, "buscando...");

    try {
      const res = await fetch(
        `${API}/api/spotify/search?q=${encodeURIComponent(query)}`,
        { headers: authHeader() },
      );
      const data = await res.json();

      if (!res.ok || !data.tracks || data.tracks.length === 0) {
        setSpotifyResultsMessage(resultsEl, "nenhum resultado.");
        return;
      }

      resultsEl.innerHTML = data.tracks
        .map((track) => renderSpotifyResultItem(track, variant))
        .join("");

      resultsEl.querySelectorAll(itemSelector).forEach((item) => {
        item.addEventListener("click", () => {
          selectTrack(item.dataset.url, item.dataset.name, item);
        });
      });
    } catch (err) {
      setSpotifyResultsMessage(resultsEl, "erro ao buscar.", "error");
      console.error(err);
    }
  }

  function selectTrack(url, name, clickedEl) {
    hiddenUrlEl.value = url;
    if (trackHiddenEl) trackHiddenEl.value = name;

    if (variant === "card") {
      clearCardSelection();
      if (clickedEl) clickedEl.classList.add("selected");
    } else if (selectedEl) {
      selectedEl.classList.remove("hide");
      selectedEl.innerHTML = `
        <span class="spotify-dot"></span>
        <span class="spotify-selected-name">${escapeHtml(name)}</span>
        <button type="button" class="spotify-clear" aria-label="remover música">✕</button>
      `;

      selectedEl
        .querySelector(".spotify-clear")
        .addEventListener("click", clearSelection);

      resultsEl.classList.add("hide");
      input.value = "";
    }
  }

  function clearSelection() {
    hiddenUrlEl.value = "";
    if (trackHiddenEl) trackHiddenEl.value = "";
    clearCardSelection();

    if (selectedEl) {
      selectedEl.classList.add("hide");
      selectedEl.innerHTML = "";
    }
  }

  function showSelected(name) {
    if (!name) return;

    if (variant === "card") {
      if (trackHiddenEl) trackHiddenEl.value = name;
      return;
    }

    if (!selectedEl) return;

    selectedEl.classList.remove("hide");
    selectedEl.innerHTML = `
      <span class="spotify-dot"></span>
      <span class="spotify-selected-name">${escapeHtml(name)}</span>
      <button type="button" class="spotify-clear" aria-label="remover música">✕</button>
    `;

    selectedEl
      .querySelector(".spotify-clear")
      .addEventListener("click", clearSelection);
  }

  button.addEventListener("click", search);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      search();
    }
  });

  return { showSelected, clearSelection };
}
