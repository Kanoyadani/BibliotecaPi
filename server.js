const express = require('express');
const cors = require('cors');
const { criarLivro } = require('./livroService');
const { criaraluno } = require('./alunoService');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

console.log('Servidor iniciado');

// ================= LIVROS =================

// Criar livro
app.post('/livros', async (req, res) => {
  try {
    console.log('📘 BODY LIVRO 👉', req.body);

    const livro = await criarLivro(req.body);
    res.status(201).json(livro);

  } catch (err) {
    console.error('❌ ERRO LIVRO 👉', err);
    res.status(500).json({ erro: err.message });
  }
});

// Buscar livros (autocomplete)
app.get('/livros', async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      'SELECT title FROM books WHERE title ILIKE $1 LIMIT 10',
      [`%${q}%`]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('❌ ERRO BUSCA LIVROS 👉', err);
    res.status(500).json({ erro: 'Erro ao buscar livros' });
  }
});

// ================= ALUNOS =================

// Criar aluno
app.post('/alunos', async (req, res) => {
  try {
    console.log('👨‍🎓 BODY ALUNO 👉', req.body);

    const aluno = await criaraluno(req.body);
    res.status(201).json(aluno);

  } catch (err) {
    console.error('❌ ERRO ALUNO 👉', err);
    res.status(500).json({ erro: err.message });
  }
});

// ================= START =================
app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});
