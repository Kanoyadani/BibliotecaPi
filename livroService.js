const pool = require("./db");

async function criarLivro({ title, author, category, localizacao, quantidade, emprestador = false }) {
  const sql = `
    INSERT INTO books (title, author, category, localizacao, quantidade, emprestador)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const result = await pool.query(sql, [
    title,
    author,
    category,
    localizacao,
    quantidade,
    emprestador,
  ]);

  return result.rows[0];
}

module.exports = { criarLivro };