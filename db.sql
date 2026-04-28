/*CREATE TABLE books (
    idbook INT GENERATED ALWAYS AS IDENTITY (
        START WITH 1
        INCREMENT BY 1
        MINVALUE 1
    ) PRIMARY KEY,
    
    title VARCHAR(30),
    author VARCHAR(50),
	Category VARCHAR(15),
	emprestador boolean 
);*/

/*CREATE TABLE alunos (
    id_aluno INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    matricula   VARCHAR(30) UNIQUE,
    serie       VARCHAR(10),
    criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);*/

/*CREATE TABLE emprestimos (
    id_emprestimo INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idbook INT NOT NULL,
	nome_aluno VARCHAR (50),
	serie VARCHAR (5),
	email VARCHAR(50),
	matricula VARCHAR (50),
    data_emprestimo DATE DEFAULT CURRENT_DATE,
    data_devolucao DATE,
    CONSTRAINT fk_livro
        FOREIGN KEY (idbook)
        REFERENCES books(idbook)
        ON DELETE CASCADE
);*/

/*CREATE VIEW vw_emprestimos AS
SELECT
    e.*,
    CASE
        WHEN e.data_devolucao IS NULL
            THEN CURRENT_DATE - e.data_emprestimo
        ELSE e.data_devolucao - e.data_emprestimo
    END AS dias_emprestados
FROM emprestimos e;*/

--SELECT NOW();
--SELECT * FROM books

