

# 📚 Sistema de Gestão Bibliotecária - CMEI

Este é um sistema Fullstack desenvolvido para o gerenciamento de acervo e empréstimos da biblioteca do **CMEI Dona Maria Benedita Garcia da Silva**. O projeto permite o controle total de livros (com saldo de estoque), cadastro de alunos, empréstimos e devoluções com persistência em PostgreSQL.

## 🚀 Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3 (Modern UI), JavaScript Vanilla (AJAX/Fetch API / Hash Routing).
* **Backend:** Node.js, Express.js.
* **Banco de Dados:** PostgreSQL (Relacional).
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
Para subir o container do PostgreSQL com as credenciais configuradas:
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
Dentro do terminal do Postgres, cole os seguintes comandos para criar a estrutura atualizada:

```sql
CREATE TABLE books (
    idbook INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    Category VARCHAR(100) NOT NULL,
    quantidade INT DEFAULT 1,
    emprestador BOOLEAN DEFAULT FALSE
);

CREATE TABLE alunos (
    id_aluno INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    serie VARCHAR(20),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emprestimos (
    id_emprestimo INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    idbook INT NOT NULL,
    nome_aluno VARCHAR(255),
    email VARCHAR(255),
    matricula VARCHAR(50),
    serie VARCHAR(20),
    data_emprestimo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_devolucao TIMESTAMP,
    CONSTRAINT fk_livro FOREIGN KEY (idbook) REFERENCES books(idbook) ON DELETE CASCADE
);
```

### 4. Instalar as dependências e Iniciar
```bash
npm install
node server.js
```
O sistema estará disponível em: `http://localhost:3000`

---

## 💡 Funcionalidades Implementadas

* **Navegação por Hash (#):** Sistema de rotas Single Page Application (SPA) que permite recarregar a página sem perder a aba atual.
* **Gestão de Estoque:** Cadastro de livros incluindo o campo de **Quantidade** para controle de acervo.
* **Empréstimo Inteligente:** Busca dinâmica de livros com autocomplete e vinculação automática dos dados do aluno via matrícula.
* **Devolução Profissional:** Fluxo de busca de livros emprestados com visualização de detalhes antes da confirmação do recebimento.
* **Listagem Geral:** Aba dedicada para visualização em tempo real de todos os livros (com status e saldo) e alunos cadastrados.
* **Validações Robustas:** Tratamento de erros para campos vazios, e-mails inválidos e matrículas duplicadas tanto no Front quanto no Back-end.
* **Arquitetura Limpa:** Componentização de Header e Footer em arquivos separados carregados via JavaScript.

## 📄 Licença
Este projeto é para fins acadêmicos e de gestão escolar local do CMEI Dona Maria Benedita Garcia da Silva.

---
