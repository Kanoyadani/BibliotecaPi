const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");
const { criarLivro } = require("./livroService");
const { criaraluno } = require("./alunoService");
const { criaremprestimo } = require("./emprestimoservice");

const app = express();

// Configurações e Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve CSS, JS e imagens da pasta raiz

// Rota Principal - Entrega o Front-end
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

// ================= ROTAS DE LIVROS =================

// Validar Cadastro de Livro
app.post("/livros", async (req, res) => {
  const { title, author, category, quantidade } = req.body;
  if (!title || !author || !category || !quantidade) {
    return res.status(400).json({ erro: "Todos os campos, incluindo quantidade, são obrigatórios!" });
  }
  try {
    const livro = await criarLivro(req.body);
    res.status(201).json(livro);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao salvar livro no banco." });
  }
});

// Buscar livros (Autocomplete)
app.get("/livros", async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);

  try {
    const result = await pool.query(
      "SELECT * FROM books WHERE title ILIKE $1 LIMIT 10",
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERRO AO BUSCAR LIVROS:", err);
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

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ ERRO AO ATUALIZAR STATUS DO LIVRO:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= ROTAS DE ALUNOS =================

// Criar novo aluno
// Validar Cadastro de Aluno
app.post("/alunos", async (req, res) => {
  const { nome, matricula, email } = req.body;
  if (!nome || !matricula || !email) {
    return res.status(400).json({ erro: "Nome, Matrícula e Email são obrigatórios!" });
  }
  try {
    const aluno = await criaraluno(req.body);
    res.status(201).json(aluno);
  } catch (err) {
    if (err.code === '23505') { // Erro de duplicidade do Postgres
      return res.status(400).json({ erro: "Matrícula ou Email já cadastrados!" });
    }
    res.status(500).json({ erro: "Erro ao cadastrar aluno." });
  }
});

// Buscar aluno por matrícula
app.get("/alunos", async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 1) return res.json([]);

  try {
    const result = await pool.query(
      "SELECT * FROM alunos WHERE matricula = $1",
      [q]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERRO AO BUSCAR ALUNO:", err);
    res.status(500).json({ erro: "Erro ao buscar aluno" });
  }
});

// ================= ROTAS DE EMPRÉSTIMO =================

// Registrar empréstimo
app.post("/emprestimoservice", async (req, res) => {
  try {
    const emprestimo = await criaremprestimo(req.body);
    res.status(201).json(emprestimo);
  } catch (err) {
    console.error("❌ ERRO AO REGISTRAR EMPRÉSTIMO:", err);
    res.status(500).json({ erro: err.message });
  }
});

// Registrar devolução de livro
app.patch("/devolver/:id", async (req, res) => {
  const idbook = req.params.id;

  try {
    // 1. Atualiza o status do livro para disponível
    await pool.query(
      "UPDATE books SET emprestador = false WHERE idbook = $1",
      [idbook]
    );

    // 2. Finaliza o registro de empréstimo com a data atual
    const result = await pool.query(
      `UPDATE emprestimos
       SET data_devolucao = NOW()
       WHERE idbook = $1 AND data_devolucao IS NULL
       RETURNING *`,
      [idbook]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Empréstimo ativo não encontrado para este livro" });
    }

    res.json({ message: "Livro devolvido com sucesso!" });
  } catch (err) {
    console.error("❌ ERRO NA DEVOLUÇÃO:", err);
    res.status(500).json({ error: err.message });
  }
});

// Inicialização do Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});