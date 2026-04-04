const pool = require("./db");

async function criarLivro({ title, author, Category, Emprestado }) {
  const sql = `
    INSERT INTO Books (title, author, category, Emprestador)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const result = await pool.query(sql, [title, author, Category, Emprestado]);
  return result.rows[0];
}

module.exports = { criarLivro };
