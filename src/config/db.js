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
  .then((conn) => {
    console.log("MySQL conectado com sucesso.");
    conn.release(); // devolve a conexão pro pool
  })
  .catch((err) => {
    console.error("Erro ao conectar no MySQL:", err.message);
    process.exit(1); // encerra o processo se não conseguir conectar
  });

module.exports = pool;
