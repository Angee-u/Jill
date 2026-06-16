/* Chamar o env com os dados, não esquecer dele no gitignore */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./src/routes/authRoutes");
const postRoutes = require("./src/routes/postRoutes");
const spotifyRoutes = require("./src/routes/spotifyRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

/* Início das ferramentas, middlewares para as requisições */
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5500"],
    credentials: true,
  }),
);

// JSON - basicamente para usar os "req", ou seja, coletar as informações no HTML
app.use(express.json());

// Formulários
app.use(express.urlencoded({ extended: true }));

// Meus arquivos para o front, como não estou usando o EJS :(
app.use(express.static(path.join(__dirname, "public")));

/* ROTAS */

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/spotify", spotifyRoutes);

// HOME
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// SERVER
app.listen(PORT, () => {
  console.log(`Servidor rodando na ${PORT}`);
})




