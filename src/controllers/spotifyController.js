const axios = require("axios");
const { getSpotifyToken } = require("../config/spotify");

exports.searchTrack = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Informe um termo de busca." });
    }

    const token = await getSpotifyToken();

    const response = await axios.get("https://api.spotify.com/v1/search", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q,
        type: "track",
        limit: 5,
        market: "BR",
      },
    });

    // Para o Front - NUNCA MAIS
    const tracks = response.data.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      cover: track.album.images[1]?.url,
      preview_url: track.preview_url,
      spotify_url: track.external_urls.spotify,
      embed_url: `https://open.spotify.com/embed/track/${track.id}`,
    }));

    return res.json({ tracks });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Erro ao buscar no Spotify." });
  }
};

// Buscando uma musga
exports.getTrack = async (req, res) => {
  try {
    const { id } = req.params;
    const token = await getSpotifyToken();

    const response = await axios.get(
      `https://api.spotify.com/v1/tracks/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const track = response.data;

    return res.json({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      album: track.album.name,
      cover: track.album.images[1]?.url,
      preview_url: track.preview_url,
      embed_url: `https://open.spotify.com/embed/track/${track.id}`,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Erro ao buscar a track." });
  }
};
