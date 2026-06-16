const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Testa a conexão
pool
  .getConnection()
  .then(async (conn) => {
    console.log("MySQL conectado com sucesso.");
    try {
      await conn.query(
        "ALTER TABLE posts ADD COLUMN spotify_track VARCHAR(255) NULL AFTER spotify_url",
      );
      console.log("Coluna spotify_track adicionada.");
    } catch (err) {
      if (err.code !== "ER_DUP_FIELDNAME") {
        console.warn("Aviso ao verificar coluna spotify_track:", err.message);
      }
    }
    conn.release();
  })
  .catch((err) => {
    console.error("Erro ao conectar no MySQL:", err.message);
    process.exit(1); // encerra o processo se não conseguir conectar
  });

module.exports = pool;
