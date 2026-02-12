/*CREATE TABLE books (
    idbook INT GENERATED ALWAYS AS IDENTITY (
        START WITH 1
        INCREMENT BY 1
        MINVALUE 1
    ) PRIMARY KEY,
    
    title VARCHAR(30),
    author VARCHAR(50)
);*/
--SELECT NOW();
--SELECT * FROM Books
--DELETE FROM BOOKS
/*CREATE TABLE emprestimos (
  idEmprestimo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idbook INTEGER NOT NULL,
  nome_aluno VARCHAR(50) NOT NULL,
  serie VARCHAR(5),
  email VARCHAR(50),
  matricula VARCHAR(20),
  data_emprestimo TIMESTAMP DEFAULT NOW(),
  data_devolucao TIMESTAMP,

  CONSTRAINT fk_book
    FOREIGN KEY (idbook)
    REFERENCES books(idbook)
);*/