function initAmbientPlayer() {
  document.querySelectorAll("[data-ambient-player]").forEach((container) => {
    container.innerHTML = `
      <p class="sidebar-title">// tocando agora</p>
      <div class="spotify-bar">
        <span class="spotify-dot"></span>
        <span class="spotify-track">${escapeHtml(AMBIENT_TRACK.label)}</span>
      </div>
      <div class="ambient-spotify">
        <iframe
          src="https://open.spotify.com/embed/track/${AMBIENT_TRACK.id}?utm_source=generator&theme=0"
          width="100%"
          height="80"
          frameborder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="${escapeHtml(AMBIENT_TRACK.label)}">
        </iframe>
      </div>
    `;
  });
}

document.addEventListener("DOMContentLoaded", initAmbientPlayer);
