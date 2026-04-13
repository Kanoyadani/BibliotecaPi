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
      if (selectedBook.emprestador) return alert("❌ Livro já emprestado!");

      const formemp = document.getElementById("formemp");
      formemp.style.display = "block";
      document.getElementById("idbooksave").value = selectedBook.idbook;

      const btnEmp = document.getElementById("btnemp");

      btnEmp.onclick = async (e) => {
        e.preventDefault();
        const matricula = document
          .getElementById("matriculaAlunoinf")
          .value.trim();
        if (!matricula) return alert("Informe uma matrícula válida");

        try {
          const res = await fetch(
            `http://localhost:3000/alunos?q=${matricula}`,
          );
          const alunos = await res.json();
          if (alunos.length === 0) return alert("Aluno não encontrado");

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

          // salvar empréstimo
          const emprestimoRes = await fetch(
            "http://localhost:3000/emprestimoservice",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dados),
            },
          );
          if (!emprestimoRes.ok) throw new Error();

          await fetch(`http://localhost:3000/livros/${selectedBook.idbook}`, {
            method: "PATCH",
          });
          selectedBook.emprestador = true;

          alert(`📚 Livro emprestado para ${alunoSelecionado.nome}!`);

          document.getElementById("matriculaAlunoinf").value = "";
          formemp.style.display = "none";
        } catch (err) {
          console.error(err);
          alert("❌ Erro ao emprestar livro");
        }
      };
    });
  }
});
