const pool = require('./db');

async function criarLivro({ title, author,Category }) {
  const sql = `
    INSERT INTO Books (title, author,Category)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const result = await pool.query(sql, [title, author,Category]);
  return result.rows[0];
}

module.exports = { criarLivro};