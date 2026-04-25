
---

# 📚 Sistema de Gestão Bibliotecária - CMEI

Este é um sistema Fullstack desenvolvido para o gerenciamento de acervo e empréstimos da biblioteca do **CMEI Dona Maria Benedita Garcia da Silva**. O projeto permite o cadastro de livros, alunos e o vínculo de empréstimos com persistência em banco de dados relacional.

## 🚀 Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3 (Modern UI), JavaScript Vanilla (AJAX/Hash Routing).
* **Backend:** Node.js, Express.js.
* **Banco de Dados:** PostgreSQL.
* **Infraestrutura:** Docker.

---

## 🛠️ Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (Versão 18 ou superior).
* [Docker](https://www.docker.com/) (Para rodar o banco de dados).

---

## 🏁 Como configurar e rodar o projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/BibliotecaPi-main.git
cd BibliotecaPi-main
```

### 2. Configurar o Banco de Dados (Docker)
Para subir o container do PostgreSQL com as credenciais já configuradas no `db.js`:
```bash
sudo docker run --name bibliotecapi-db \
  -e POSTGRES_PASSWORD=123siltec321 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 -d postgres
```

### 3. Criar a estrutura das tabelas
Acesse o terminal do banco de dados:
```bash
sudo docker exec -it bibliotecapi-db psql -U postgres
```
Dentro do terminal do Postgres, cole os comandos do arquivo `db.sql` ou execute:
```sql
CREATE TABLE books (
    idbook SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    Category VARCHAR(100)
);

CREATE TABLE alunos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    matricula VARCHAR(50),
    serie VARCHAR(20),
    registro VARCHAR(50)
);

CREATE TABLE emprestimos (
    idEmprestimo SERIAL PRIMARY KEY,
    idbook INTEGER NOT NULL,
    nome_aluno VARCHAR(255) NOT NULL,
    data_emprestimo TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_book FOREIGN KEY (idbook) REFERENCES books(idbook)
);
```

### 4. Instalar as dependências do Node.js
```bash
npm install
```

### 5. Iniciar o Servidor
```bash
node server.js
```
O servidor estará rodando em: `http://localhost:3000/main.html`

---

## 💡 Funcionalidades Implementadas

* **Navegação Inteligente:** Sistema de rotas via `#hash` que mantém o usuário na mesma tela após o recarregamento (F5).
* **UI/UX Moderna:** Interface limpa, responsiva, com cabeçalho e rodapé fixos.
* **Cadastro Flexível:** Seleção de categorias com suporte a campos customizados ("Outro").
* **Autocomplete:** Busca dinâmica de livros para facilitar a seleção no momento do empréstimo.
* **Segurança de Dados:** Vinculação técnica entre tabelas de livros e registros de saída.

## 📄 Licença
Este projeto é para fins acadêmicos e de gestão escolar local.

---
