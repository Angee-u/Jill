const axios = require("axios");

let cachedToken = null;
let tokenExpiry = null;

async function getSpotifyToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  cachedToken = response.data.access_token;
  // O token dura 1 hora, tem que reativar para a possível apresentação
  tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

  return cachedToken;
}

module.exports = { getSpotifyToken };
