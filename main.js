const rotas = {
  '#novo-livro': 'formadd',
  '#novo-aluno': 'addalunocreate',
  '#emprestimo': 'formbausca',
  '#devolucao': 'formdev',
  '#listagem': 'listagemGeral'
};

// ================== COMPONENTES (HEADER/FOOTER) ==================
async function carregarComponentes() {
  try {
    const [h, f] = await Promise.all([
      fetch("header.html"), 
      fetch("footer.html")
    ]);
    document.getElementById("header-placeholder").innerHTML = await h.text();
    document.getElementById("footer-placeholder").innerHTML = await f.text();
  } catch (err) { 
    console.error("Erro ao carregar componentes:", err); 
  }
}

// Função para exibir notificações bonitas
function showToast(mensagem, tipo = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = mensagem;
  toast.className = ""; // Limpa classes anteriores
  toast.classList.add(tipo); 
  toast.style.display = "block";

  // Esconde o toast após 3 segundos
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

// ================== NAVEGAÇÃO E ROTAS ==================
function esconderTudo() {
  ['formadd', 'formbausca', 'addalunocreate', 'formdev', 'listagemGeral'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  
  const areaEmp = document.getElementById("areaEmprestimo");
  if (areaEmp) areaEmp.style.display = "none";
  
  const areaDev = document.getElementById("areaConfirmacaoDevolucao");
  if (areaDev) areaDev.style.display = "none";
}

function gerenciarRotas() {
  const hash = window.location.hash || '#novo-livro';
  esconderTudo();
  if (rotas[hash]) {
    const elemento = document.getElementById(rotas[hash]);
    if (elemento) {
      elemento.style.display = "block";
      if (hash === '#listagem') carregarListagens();
    }
  }
}

window.addEventListener('hashchange', gerenciarRotas);

// Atalhos dos botões
function addbook() { window.location.hash = 'novo-livro'; }
function addaluno() { window.location.hash = 'novo-aluno'; }
function buscabook() { window.location.hash = 'emprestimo'; }
function devolver() { window.location.hash = 'devolucao'; }
function verListagem() { window.location.hash = 'listagem'; }

function toggleOutroInput() {
  const select = document.getElementById("CategoriaSelect");
  const divOutro = document.getElementById("outroCategoriaDiv");
  divOutro.style.display = (select.value === "Outro") ? "block" : "none";
}

// ================== CARREGAR LISTAGENS ==================
async function carregarListagens() {
  try {
    const resL = await fetch("http://localhost:3000/livros");
    const livros = await resL.json();
    document.querySelector("#tabelaLivros tbody").innerHTML = livros.map(l => `
      <tr>
        <td>${l.idbook}</td>
        <td>${l.title}</td>
        <td>${l.author}</td>
        <td>${l.quantidade}</td>
        <td>${l.localizacao}</td>
        <td>${l.emprestador ? "🔴 Emprestado" : "🟢 Disponível"}</td>
      </tr>`).join("");

    const resA = await fetch("http://localhost:3000/alunos");
    const alunos = await resA.json();
    document.querySelector("#tabelaAlunos tbody").innerHTML = alunos.map(a => `
      <tr>
        <td>${a.matricula}</td>
        <td>${a.nome}</td>
        <td>${a.email}</td>
        <td>${a.celular}</td>
        <td>${a.serie}</td>
      </tr>`).join("");
  } catch (err) { console.error(err); }
}

// ================== EVENTOS (DOM READY) ==================
document.addEventListener("DOMContentLoaded", () => {
  carregarComponentes(); 
  gerenciarRotas();      

  // CADASTRO LIVRO
  document.getElementById("formbook").addEventListener("submit", async (e) => {
    e.preventDefault();
    const cat = document.getElementById("CategoriaSelect").value === "Outro" ? 
                document.getElementById("CategoriaOutro").value : document.getElementById("CategoriaSelect").value;
    
    // OBJETO ATUALIZADO COM O CAMPO DE LOCALIZAÇÃO
    const data = {
      title: document.getElementById("titlebook").value.trim(),
      author: document.getElementById("authorbook").value.trim(),
      localizacao: document.getElementById("localizacaolivro").value.trim(),
      quantidade: document.getElementById("quantidadelivro").value,
      category: cat
    };

    try {
      const res = await fetch("http://localhost:3000/livros", {
        method: "POST", 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.erro || "Erro ao cadastrar livro");

      showToast("✅ Livro cadastrado com sucesso!", "success");
      e.target.reset();
    } catch (err) {
      showToast("❌ " + err.message, "error");
    }
  });

  // CADASTRO ALUNO
  document.getElementById("formaluno").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // OBJETO ATUALIZADO COM O CAMPO DE CELULAR
    const data = {
      nome: document.getElementById("nomealuno").value.trim(),
      email: document.getElementById("emailaluno").value.trim(),
      celular: document.getElementById("celularaluno").value.trim(),
      matricula: document.getElementById("matriculaaluno").value.trim(),
      serie: document.getElementById("seriealuno").value.trim()
    };

    try {
      const res = await fetch("http://localhost:3000/alunos", {
        method: "POST", 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.erro || showToast("Erro ao cadastrar aluno"));

      showToast("✅ Aluno cadastrado com sucesso!", "success");
      e.target.reset();
    } catch (err) {
      showToast("❌ " + err.message, "error");
    }
  });

  // BUSCA LIVRO EMPRÉSTIMO
  document.getElementById("searchBook").addEventListener("input", async (e) => {
    const q = e.target.value;
    if (q.length < 2) return;
    const res = await fetch(`http://localhost:3000/livros?q=${q}`);
    const books = await res.json();
    const sug = document.getElementById("suggestions");
    sug.innerHTML = books.map(b => `<li onclick="selecionarLivro(${b.idbook}, '${b.title}', '${b.author}', ${b.emprestador})">${b.title}</li>`).join("");
  });

  // CONFIRMAR EMPRÉSTIMO
  document.getElementById("formLend").addEventListener("submit", async (e) => {
    e.preventDefault();
    const idBook = document.getElementById("idBookSelecionado").value;
    const matricula = document.getElementById("matriculaSelecionada").value;

    if (!idBook || !matricula) {
      showToast("❌ Selecione um livro e um aluno!", "error");
      return;
    }

    try {
      // Ajustado para a rota correta do backend (/emprestimos)
      const res = await fetch("http://localhost:3000/emprestimos", {
        method: "POST", 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ idbook: idBook, matricula: matricula })
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.erro || "Erro no empréstimo");

      showToast("🤝 Empréstimo realizado com sucesso!", "success");
      setTimeout(() => location.reload(), 1500); 
    } catch (err) {
      showToast("❌ " + err.message, "error");
    }
  });

  // DEVOLUÇÃO (BUSCA)
  document.getElementById("searchDevolucao")?.addEventListener("input", async (e) => {
      const q = e.target.value;
      if (q.length < 2) return;
      const res = await fetch(`http://localhost:3000/livros?q=${q}`);
      const books = await res.json();
      const sug = document.getElementById("suggestionsDevolucao");
      sug.innerHTML = books.map(b => `<li onclick="selecionarDevolucao(${b.idbook}, '${b.title}')">📙 ${b.title}</li>`).join("");
  });

  // CONFIRMAR RECEBIMENTO (DEVOLUÇÃO)
  document.getElementById("formReturn").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("idLivroDevolucao").value;
    
    try {
      const res = await fetch(`http://localhost:3000/devolver/${id}`, { method: "PATCH" });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Erro na devolução");

      showToast("↩️ Livro devolvido com sucesso!", "success");
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      showToast("❌ " + err.message, "error");
    }
  });
});

// ================== FUNÇÕES DE APOIO (GLOBAL) ==================

function selecionarLivro(id, titulo, autor, emp) {
  document.getElementById("searchBook").value = titulo;
  document.getElementById("idBookSelecionado").value = id;
  document.getElementById("detalheAutor").textContent = autor;
  document.getElementById("detalheStatus").textContent = emp ? "🔴 Emprestado" : "🟢 Disponível";
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("areaEmprestimo").style.display = "block";
}

function selecionarDevolucao(id, titulo) {
    document.getElementById("searchDevolucao").value = titulo;
    document.getElementById("idLivroDevolucao").value = id;
    document.getElementById("devTitulo").textContent = titulo;
    document.getElementById("suggestionsDevolucao").innerHTML = "";
    document.getElementById("areaConfirmacaoDevolucao").style.display = "block";
}

// Busca de aluno por matrícula no empréstimo
document.addEventListener("input", async (e) => {
    if (e.target.id === "alunoEmprestimo") {
        const q = e.target.value;
        if (q.length < 1) return;
        const res = await fetch(`http://localhost:3000/alunos?q=${q}`);
        const alunos = await res.json();
        const sug = document.getElementById("studentSuggestions");
        sug.innerHTML = alunos.map(a => 
            `<li onclick="document.getElementById('matriculaSelecionada').value='${a.matricula}'; document.getElementById('alunoEmprestimo').value='${a.nome}'; document.getElementById('studentSuggestions').innerHTML=''">${a.nome} (${a.matricula})</li>`
        ).join("");
    }
});