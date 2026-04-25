// ================== CARREGAMENTO TRADICIONAL (AJAX) ==================
function loadComponent(id, file) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      document.getElementById(id).innerHTML = xhr.responseText;
    }
  };
  xhr.open("GET", file, true);
  xhr.send();
}

// ================== CONTROLE DE ROTAS (HASH) ==================
function esconderTudo() {
  document.getElementById("formadd").style.display = "none";
  document.getElementById("formbausca").style.display = "none";
  document.getElementById("addalunocreate").style.display = "none";
}

function addbook() {
  window.location.hash = "#add-livro";
}

function addaluno() {
  window.location.hash = "#add-aluno";
}

function buscabook() {
  window.location.hash = "#buscar-livro";
}

function verificarRota() {
  esconderTudo();
  const rota = window.location.hash;

  if (rota === "#add-livro") {
    document.getElementById("formadd").style.display = "flex";
  } else if (rota === "#add-aluno") {
    document.getElementById("addalunocreate").style.display = "flex";
  } else if (rota === "#buscar-livro") {
    document.getElementById("formbausca").style.display = "flex";
  }
}

// ================== FUNÇÕES AUXILIARES ==================
function toggleOutroInput() {
  var select = document.getElementById("CategoriaSelect");
  var divOutro = document.getElementById("outroCategoriaDiv");

  if (select && select.value === "Outro") {
    divOutro.style.display = "block";
  } else if (divOutro) {
    divOutro.style.display = "none";
  }
}

// ================== INICIALIZAÇÃO E EVENTOS ==================

window.addEventListener("load", function () {
  loadComponent('header-placeholder', 'header.html');
  loadComponent('footer-placeholder', 'footer.html');
  verificarRota();
});

window.addEventListener("hashchange", verificarRota);

document.addEventListener("DOMContentLoaded", () => {
  verificarRota();

  // ================== ADD BOOK ==================
  const formBook = document.getElementById("formbook");
  if (formBook) {
    formBook.addEventListener("submit", async (e) => {
      e.preventDefault();

      var categoriaFinal = document.getElementById("CategoriaSelect").value;
      if (categoriaFinal === "Outro") {
        categoriaFinal = document.getElementById("CategoriaOutro").value;
      }

      const dados = {
        title: document.getElementById("titlebook").value,
        author: document.getElementById("authorbook").value,
        Category: categoriaFinal
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
        window.location.hash = "";

      } catch {
        alert("❌ Erro ao cadastrar livro");
      }
    });
  }

  // ================== ADD ALUNO ==================
  const formAluno = document.getElementById("formaluno");
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
        window.location.hash = "";

      } catch {
        alert("❌ Erro ao cadastrar aluno");
      }
    });
  }

  // ================== BUSCA E EMPRÉSTIMO ==================
  const input = document.getElementById("searchBook");
  const list = document.getElementById("suggestions");
  const formSearch = document.getElementById("formSearchBook");

  if (input && list) {
    input.addEventListener("input", async () => {
      const value = input.value.trim();
      list.innerHTML = "";
      document.getElementById("areaEmprestimo").style.display = "none";

      if (value.length < 2) return;

      try {
        const res = await fetch(`http://localhost:3000/livros?q=${value}`);
        if (!res.ok) throw new Error();

        const books = await res.json();

        if (books.length === 0) {
          return;
        }

        books.forEach(book => {
          const li = document.createElement("li");
          li.textContent = book.title;
          li.addEventListener("click", () => {
            input.value = book.title;
            list.innerHTML = "";

            // Debug: Aperte F12 no navegador e veja se aparece o número no console
            console.log("Livro selecionado:", book);

            const campoId = document.getElementById("idBookSelecionado");
            if (campoId) {
              // Garantimos que pegamos o idbook que veio do banco
              campoId.value = book.idbook;
            }

            document.getElementById("areaEmprestimo").style.display = "block";
          });
          list.appendChild(li);
        });

      } catch {
        console.error("Erro ao buscar livros");
      }
    });
  }

  // Evento de envio para realizar o empréstimo
  if (formSearch) {
    formSearch.addEventListener("submit", async (e) => {
      const idLivro = document.getElementById("idBookSelecionado").value;
      const nomeAluno = document.getElementById("alunoEmprestimo").value;

      // Verificação de segurança antes de enviar
      if (!idLivro || idLivro === "undefined") {
        alert("⚠️ Erro: Selecione um livro da lista de sugestões primeiro!");
        return;
      }

      const dados = {
        idbook: parseInt(idLivro), // Forçamos ser um número inteiro
        nome_aluno: nomeAluno
      };

      try {
        const res = await fetch("http://localhost:3000/emprestimos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados)
        });

        if (!res.ok) throw new Error();

        alert("✅ Empréstimo realizado com sucesso!");
        formSearch.reset();
        document.getElementById("areaEmprestimo").style.display = "none";
        window.location.hash = "";
      } catch {
        alert("❌ Erro ao processar empréstimo");
      }
    });
  }
});