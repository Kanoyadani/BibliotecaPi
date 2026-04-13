const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { criarLivro } = require("./livroService");
const { criaraluno } = require("./alunoService");
const { criaremprestimo } = require("./emprestimoservice");

const app = express();
app.use(cors());
app.use(express.json());

console.log("Servidor iniciado");

// ================= LIVROS =================

// Criar livro
app.post("/livros", async (req, res) => {
  try {
    const livro = await criarLivro(req.body);
    res.status(201).json(livro);
  } catch (err) {
    console.error("❌ ERRO LIVRO 👉", err);
    res.status(500).json({ erro: err.message });
  }
});

// Buscar livros (autocomplete)
app.get("/livros", async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);

  try {
    const result = await pool.query(
      "SELECT * FROM books WHERE title ILIKE $1 LIMIT 10",
      [`%${q}%`],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERRO BUSCA LIVROS 👉", err);
    res.status(500).json({ erro: "Erro ao buscar livros" });
  }
});
// Marcar livro como emprestado
app.patch("/livros/:id", async (req, res) => {
  const idbook = req.params.id;
  try {
    const sql = `
      UPDATE books
      SET emprestador = true
      WHERE idbook = $1
      RETURNING *;
    `;
    const result = await pool.query(sql, [idbook]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Livro não encontrado" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ ERRO ao atualizar livro:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= ALUNOS =================

// Criar aluno
app.post("/alunos", async (req, res) => {
  try {
    const aluno = await criaraluno(req.body);
    res.status(201).json(aluno);
  } catch (err) {
    console.error("❌ ERRO ALUNO 👉", err);
    res.status(500).json({ erro: err.message });
  }
});

// Buscar aluno
app.get("/alunos", async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 1) return res.json([]);

  try {
    const result = await pool.query(
      "SELECT * FROM alunos WHERE matricula = $1",
      [q],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERRO BUSCA ALUNO 👉", err);
    res.status(500).json({ erro: "Erro ao buscar aluno" });
  }
});

// ================= EMPRESTIMO =================
app.post("/emprestimoservice", async (req, res) => {
  try {
    const emprestimo = await criaremprestimo(req.body);
    res.status(201).json(emprestimo);
  } catch (err) {
    console.error("❌ ERRO Emprestimo 👉", err);
    res.status(500).json({ erro: err.message });
  }
});

// ================= START =================
app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});
