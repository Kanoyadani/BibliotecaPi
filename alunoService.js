const pool = require("./db");

async function criaraluno({ nome, email, celular, matricula, serie }) {
  const sql = `
    INSERT INTO alunos (nome, email, celular, matricula, serie)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const result = await pool.query(sql, [
    nome,
    email,
    celular,
    matricula,
    serie,
  ]);
  
  return result.rows[0];
}

module.exports = { criaraluno };