const pool = require("./db");

async function criaremprestimo({
  idbook,
  nome_aluno,
  serie,
  email,
  matricula,
  data_emprestimo,
  data_devolucao,
}) {
  const sql = `
    INSERT INTO emprestimos 
    (idbook, nome_aluno, serie, email, matricula, data_emprestimo, data_devolucao)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *;
  `;

  const result = await pool.query(sql, [
    idbook,
    nome_aluno,
    serie,
    email,
    matricula,
    data_emprestimo,
    data_devolucao,
  ]);

  return result.rows[0];
}

module.exports = { criaremprestimo };
