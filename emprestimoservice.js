const pool = require("./db");

async function criaremprestimo({ idbook, nome_aluno, matricula }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Inicia a transação com o banco

        // 1. Verifica se o livro existe e se tem quantidade > 0
        const checkBook = await client.query('SELECT quantidade FROM books WHERE idbook = $1', [idbook]);
        if (checkBook.rows.length === 0) throw new Error("Livro não encontrado.");
        if (checkBook.rows[0].quantidade <= 0) throw new Error("Livro sem estoque disponível.");

        // 2. Registra o empréstimo
        const resEmprestimo = await client.query(
            `INSERT INTO emprestimos (idbook, nome_aluno, matricula, data_emprestimo) 
             VALUES ($1, $2, $3, NOW()) RETURNING *`,
            [idbook, nome_aluno, matricula]
        );

        // 3. Subtrai 1 da quantidade. Se a quantidade nova for 0, muda o status para emprestado (true)
        await client.query(
            `UPDATE books 
             SET quantidade = quantidade - 1,
                 emprestador = CASE WHEN (quantidade - 1) <= 0 THEN true ELSE false END
             WHERE idbook = $1`,
            [idbook]
        );

        await client.query('COMMIT'); // Salva as alterações
        return resEmprestimo.rows[0];
    } catch (e) {
        await client.query('ROLLBACK'); // Desfaz tudo se der erro
        throw e;
    } finally {
        client.release();
    }
}

module.exports = { criaremprestimo };