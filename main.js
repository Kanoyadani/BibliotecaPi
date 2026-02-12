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

// ================== DOM READY ==================
document.addEventListener("DOMContentLoaded", () => {

  esconderTudo();

  // ================== ADD BOOK ==================
  const formBook = document.getElementById("formbook");
  const formAdd = document.getElementById("formadd");

  if (formBook) {
    formBook.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dados = {
        title: document.getElementById("titlebook").value,
        author: document.getElementById("authorbook").value,
        Category: document.getElementById("Categoria").value
      };

      try {
        const response = await fetch("http://localhost:3000/livros", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados)
        });

        if (!response.ok) throw new Error();

        alert("📘 Livro cadastrado com sucesso!");
        formBook.reset();
        formAdd.style.display = "none";

      } catch {
        alert("❌ Erro ao cadastrar livro");
      }
    });
  }

  // ================== ADD ALUNO ==================
  const formAluno = document.getElementById("formaluno");
  const formAddAluno = document.getElementById("addalunocreate");

  if (formAluno) {
    formAluno.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dados = {
        nome: document.getElementById("nomealuno").value,
        email: document.getElementById("email").value,
        matricula: document.getElementById("matricula").value,
        serie: document.getElementById("serie").value,
        registro: document.getElementById("registro").value
      };

      try {
        const response = await fetch("http://localhost:3000/alunos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados)
        });

        if (!response.ok) throw new Error();

        alert("👨‍🎓 Aluno cadastrado com sucesso!");
        formAluno.reset();
        formAddAluno.style.display = "none";

      } catch {
        alert("❌ Erro ao cadastrar aluno");
      }
    });
  }

  // ================== AUTOCOMPLETE ==================
  const input = document.getElementById("searchBook");
  const list = document.getElementById("suggestions");
  const btnLend = document.getElementById("btnLend");

  if (input && list && btnLend) {
    input.addEventListener("input", async () => {
      const value = input.value.trim();
      list.innerHTML = "";
      btnLend.style.display = "none";

      if (value.length < 2) return;

      try {
        const res = await fetch(`http://localhost:3000/livros?q=${value}`);
        if (!res.ok) throw new Error();

        const books = await res.json();

        if (books.length === 0) {
          alert("📚 Livro não encontrado");
          return;
        }

        books.forEach(book => {
          const li = document.createElement("li");
          li.textContent = book.title;

          li.addEventListener("click", () => {
            input.value = book.title;
            list.innerHTML = "";
            btnLend.style.display = "block";
          });

          list.appendChild(li);
        });

      } catch {
        alert("❌ Erro ao buscar livros");
      }
    });
  }

});
