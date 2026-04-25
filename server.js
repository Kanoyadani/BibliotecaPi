const express = require('express');
const cors = require('cors');
const { criarLivro } = require('./livroService');
const { criaraluno } = require('./alunoService');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Permite que o servidor entregue arquivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// Quando você acessar localhost:3000, ele vai enviar o main.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/main.html');
});

console.log('Servidor iniciado');

// ================= LIVROS =================

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

app.get('/livros', async (req, res) => {
  const { q } = req.query;
  try {
    // CERTIFIQUE-SE QUE 'idbook' ESTÁ NO SELECT ABAIXO:
    const result = await pool.query(
      'SELECT idbook, title FROM books WHERE title ILIKE $1 LIMIT 10',
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar livros' });
  }
});

// ================= ALUNOS =================

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


// Procure por esta seção no seu server.js
// ================= EMPRÉSTIMOS =================
app.post('/emprestimos', async (req, res) => {
  const { idbook, nome_aluno } = req.body;
  try {
    const sql = `
      INSERT INTO emprestimos (idbook, nome_aluno, matricula) 
      VALUES ($1, $2, 'TEMP-001') 
      RETURNING *;
    `;
    const result = await pool.query(sql, [idbook, nome_aluno]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ ERRO EMPRÉSTIMO 👉', err);
    res.status(500).json({ erro: "Erro ao registrar empréstimo" });
  }
});

// ================= START =================
app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});

