// ================== CONTROLE DE TELAS ==================
function esconderTudo() {
  document.getElementById("formadd").style.display = "none";
  document.getElementById("formbausca").style.display = "none";
  document.getElementById("addalunocreate").style.display = "none";
}

function addbook() {
  esconderTudo();
  document.getElementById("formadd").style.display = "flex";
}

function buscabook() {
  esconderTudo();
  document.getElementById("formbausca").style.display = "flex";
}

function addaluno() {
  esconderTudo();
  document.getElementById("addalunocreate").style.display = "flex";
}

function devolver(){
  esconderTudo();
  document.getElementById("formdev").style.display = "flex"
}

// ================== DOM READY ==================
document.addEventListener("DOMContentLoaded", () => {
  esconderTudo();

  // ================== CRIAR LIVRO ==================
  const formBook = document.getElementById("formbook");

  if (formBook) {
    formBook.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const data = {
        title: document.getElementById("titlebook").value,
        author: document.getElementById("authorbook").value,
        category: document.getElementById("category").value
      };
      
       
      try {
        const res = await fetch("http://localhost:3000/livros", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await res.json();
        console.log("📚 Livro criado:", result);

        alert("Livro criado com sucesso!");
        console.log(document.getElementById("category"));

        formBook.reset();
      } catch (err) {
        console.error("❌ Erro ao criar livro:", err);
        alert("Erro ao criar livro");
      }
    });
  }

  // ================== CRIAR ALUNO ==================
  const formAluno = document.getElementById("formaluno");

  if (formAluno) {
    formAluno.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        nome: document.getElementById("nomealuno").value,
        matricula: document.getElementById("matricula").value,
        email: document.getElementById("email").value,
        serie: document.getElementById("serie").value,
        registro: document.getElementById("registro").value,
      };

      try {
        const res = await fetch("http://localhost:3000/alunos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await res.json();
        console.log("🎓 Aluno criado:", result);

        alert("Aluno criado com sucesso!");

        formAluno.reset();
      } catch (err) {
        console.error("❌ Erro ao criar aluno:", err);
        alert("Erro ao criar aluno");
      }
    });
  }

  // ================== BUSCA DE LIVROS ==================
  const input = document.getElementById("searchBook");
  const list = document.getElementById("suggestions");
  const btnLend = document.getElementById("btnLend");

  let selectedBook = null;

  if (input && list && btnLend) {
    input.addEventListener("input", async () => {
      const value = input.value.trim();
      list.innerHTML = "";
      btnLend.style.display = "none";

      if (value.length < 2) return;

      try {
        const res = await fetch(`http://localhost:3000/livros?q=${value}`);
        const books = await res.json();

        books.forEach((book) => {
          const li = document.createElement("li");
          li.textContent = book.title + " IdLivro: " + book.idbook;

          li.addEventListener("click", () => {
            input.value = book.title;
            list.innerHTML = "";
            btnLend.style.display = "block";
            selectedBook = book;
          });

          list.appendChild(li);
        });
      } catch {
        alert("❌ Erro ao buscar livros");
      }
    });

    btnLend.addEventListener("click", (e) => {
      e.preventDefault();

      if (!selectedBook) return alert("⚠️ Selecione um livro");
      if (selectedBook.emprestador)
        return alert("❌ Livro já emprestado!");

      const formemp = document.getElementById("formemp");
      formemp.style.display = "block";

      document.getElementById("idbooksave").value =
        selectedBook.idbook;

      const btnEmp = document.getElementById("btnemp");

      btnEmp.onclick = async (e) => {
        e.preventDefault();

        const matricula = document
          .getElementById("matriculaAlunoinf")
          .value.trim();

        if (!matricula)
          return alert("Informe uma matrícula válida");

        try {
          const res = await fetch(
            `http://localhost:3000/alunos?q=${matricula}`
          );

          const alunos = await res.json();

          if (alunos.length === 0)
            return alert("Aluno não encontrado");

          const alunoSelecionado = alunos[0];

          const dados = {
            idbook: selectedBook.idbook,
            nome_aluno: alunoSelecionado.nome,
            email: alunoSelecionado.email,
            matricula: alunoSelecionado.matricula,
            serie: alunoSelecionado.serie,
            data_emprestimo: new Date(),
            data_devolucao: null,
          };

          const emprestimoRes = await fetch(
            "http://localhost:3000/emprestimoservice",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dados),
            }
          );

          if (!emprestimoRes.ok) throw new Error();

          await fetch(
            `http://localhost:3000/livros/${selectedBook.idbook}`,
            {
              method: "PATCH",
            }
          );

          selectedBook.emprestador = true;

          alert(
            `📚 Livro emprestado para ${alunoSelecionado.nome}!`
          );

          document.getElementById("matriculaAlunoinf").value = "";
          formemp.style.display = "none";
        } catch (err) {
          console.error(err);
          alert("❌ Erro ao emprestar livro");
        }
      };
    });
  }

  // ================== DEVOLVER LIVRO ==================
const btnDevolver = document.getElementById("devlivro");

if (btnDevolver) {
  btnDevolver.addEventListener("click", async () => {
    const id = document.getElementById("IDlivrodev").value.trim();

    if (!id) {
      return alert("Informe o ID do livro");
    }

    try {
      const res = await fetch(`http://localhost:3000/devolver/${id}`, {
        method: "PATCH",
      });

      if (!res.ok) throw new Error();

      alert("📚 Livro devolvido com sucesso!");

      document.getElementById("IDlivrodev").value = "";

    } catch (err) {
      console.error(err);
      alert("❌ Erro ao devolver livro");
    }
  });
}
});