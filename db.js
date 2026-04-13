const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "123siltec321",
  port: 5432,
});

// teste de conexão
pool
  .query("SELECT 1")
  .then(() => console.log("Conectado ao PostgreSQL ✅"))
  .catch((err) => console.error("Erro ao conectar ❌", err));

module.exports = pool;
