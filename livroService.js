const pool = require("./db");

async function criarLivro({ title, author, category, quantidade, emprestador = false }) {
  const sql = `
    INSERT INTO books (title, author, Category, quantidade, emprestador)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  
  const result = await pool.query(sql, [
    title,
    author,
    category,
    quantidade || 1, // Se não vier quantidade, define 1 por padrão
    emprestador,
  ]);

  return result.rows[0];
}

module.exports = { criarLivro };