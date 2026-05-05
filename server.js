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

// Cadastrar Livro
app.post("/livros", async (req, res) => {
    const { title, author, category, localizacao, quantidade } = req.body;
    
    // Validação de segurança no backend (incluindo o novo campo localizacao)
    if (!title || !author || !category || !localizacao || !quantidade) {
        return res.status(400).json({ erro: "Preencha todos os campos do livro!" });
    }

    try {
        const livro = await criarLivro(req.body);
        res.status(201).json(livro);
    } catch (err) {
        console.error("❌ ERRO AO SALVAR LIVRO:", err);
        res.status(500).json({ erro: "Erro interno ao salvar livro no banco." });
    }
});

// Buscar livros (Autocomplete E Listagem Geral)
app.get("/livros", async (req, res) => {
    const { q } = req.query;
    try {
        let result;
        if (q && q.trim() !== "") {
            // Caso 1: Autocomplete (busca parcial por título)
            result = await pool.query(
                "SELECT * FROM books WHERE title ILIKE $1 ORDER BY title ASC LIMIT 10",
                [`%${q}%`]
            );
        } else {
            // Caso 2: Listagem Geral (traz tudo)
            result = await pool.query("SELECT * FROM books ORDER BY title ASC");
        }
        res.json(result.rows);
    } catch (err) {
        console.error("❌ ERRO AO BUSCAR LIVROS:", err);
        res.status(500).json({ erro: "Erro ao carregar a lista de livros." });
    }
});

// ================= ROTAS DE ALUNOS =================

// Cadastrar Aluno
app.post("/alunos", async (req, res) => {
    const { nome, email, celular, matricula, serie } = req.body;
    
    // Validação de segurança no backend (incluindo celular e série)
    if (!nome || !email || !celular || !matricula || !serie) {
        return res.status(400).json({ erro: "Preencha todos os campos do aluno!" });
    }

    try {
        const aluno = await criaraluno(req.body);
        res.status(201).json(aluno);
    } catch (err) {
        if (err.code === '23505') { // Erro de duplicidade no Postgres
            return res.status(400).json({ erro: "Esta Matrícula ou Email já está cadastrado!" });
        }
        console.error("❌ ERRO AO SALVAR ALUNO:", err);
        res.status(500).json({ erro: "Erro interno ao cadastrar aluno." });
    }
});

// Buscar alunos (Autocomplete E Listagem Geral)
app.get("/alunos", async (req, res) => {
    const { q } = req.query;
    try {
        let result;
        if (q && q.trim() !== "") {
            // Busca por matrícula ou parte do nome
            result = await pool.query(
                "SELECT * FROM alunos WHERE matricula = $1 OR nome ILIKE $2 LIMIT 10",
                [q, `%${q}%`]
            );
        } else {
            // Listagem Geral
            result = await pool.query("SELECT * FROM alunos ORDER BY nome ASC");
        }
        res.json(result.rows);
    } catch (err) {
        console.error("❌ ERRO AO BUSCAR ALUNO:", err);
        res.status(500).json({ erro: "Erro ao carregar a lista de alunos." });
    }
});

// ================= ROTAS DE EMPRÉSTIMO E DEVOLUÇÃO =================

// Registrar empréstimo (Rota corrigida para bater com o frontend)
app.post("/emprestimos", async (req, res) => {
    const { idbook, matricula } = req.body;

    if (!idbook || !matricula) {
        return res.status(400).json({ erro: "Dados insuficientes! Selecione o livro e o aluno." });
    }

    try {
        const emprestimo = await criaremprestimo(req.body);
        res.status(201).json(emprestimo);
    } catch (err) {
        console.error("❌ ERRO AO REGISTRAR EMPRÉSTIMO:", err);
        // Retorna a mensagem amigável vinda do service (ex: "Livro indisponível")
        res.status(400).json({ erro: err.message });
    }
});

// Registrar devolução
app.patch("/devolver/:id", async (req, res) => {
    const idbook = req.params.id;

    try {
        // 1. Adiciona +1 na quantidade do livro e garante que o status fique como Disponível (false)
        const updateBook = await pool.query(
            `UPDATE books 
             SET quantidade = quantidade + 1, 
                 emprestador = false 
             WHERE idbook = $1 RETURNING *`,
            [idbook]
        );

        if (updateBook.rowCount === 0) {
            return res.status(404).json({ erro: "Livro não encontrado no sistema." });
        }

        // 2. Finaliza o registro de empréstimo
        const updateEmprestimo = await pool.query(
            `UPDATE emprestimos
             SET data_devolucao = NOW()
             WHERE idbook = $1 AND data_devolucao IS NULL
             RETURNING *`,
            [idbook]
        );

        if (updateEmprestimo.rowCount === 0) {
            return res.status(404).json({ erro: "Nenhum empréstimo ativo encontrado para este livro." });
        }

        res.json({ message: "Livro devolvido com sucesso!" });
    } catch (err) {
        console.error("❌ ERRO NA DEVOLUÇÃO:", err);
        res.status(500).json({ erro: "Erro ao processar a devolução no banco de dados." });
    }
});

// Inicialização do Servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});