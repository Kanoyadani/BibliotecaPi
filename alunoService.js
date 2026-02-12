const pool = require('./db');

async function criaraluno({ nome,email,matricula,serie,criado_em}) {
  const sql = `
    INSERT INTO alunos (nome, email, matricula, serie, criado_em)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const result = await pool.query(sql, [nome, email,matricula,serie,criado_em]);
  return result.rows[0];
}

module.exports = {criaraluno};