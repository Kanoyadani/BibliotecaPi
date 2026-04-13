const pool = require("./db");

async function criarLivro({ title, author, category, emprestador = false }) {
  const sql = `
    INSERT INTO books (title, author, Category, emprestador)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const result = await pool.query(sql, [
    title,
    author,
    category,
    emprestador,
  ]);

  return result.rows[0];
}

module.exports = { criarLivro };