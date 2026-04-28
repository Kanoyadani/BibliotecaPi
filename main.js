const rotas = {
  '#novo-livro': 'formadd',
  '#novo-aluno': 'addalunocreate',
  '#emprestimo': 'formbausca',
  '#devolucao': 'formdev',
  '#listagem': 'listagemGeral' // Adicione esta linha
};

// Altere a função verListagem para mudar a hash
function verListagem() {
  window.location.hash = 'listagem';
}

async function carregarListagens() {
  try {
    // Busca Livros
    const resLivros = await fetch("http://localhost:3000/livros");
    const livros = await resLivros.json();
    const corpoLivros = document.querySelector("#tabelaLivros tbody");
    
    if (corpoLivros) {
      corpoLivros.innerHTML = livros.map(l => `
        <tr>
          <td>${l.idbook}</td>
          <td>${l.title}</td>
          <td>${l.author}</td>
          <td>${l.quantidade || 1}</td>
          <td>${l.emprestador ? "🔴 Emprestado" : "🟢 Disponível"}</td>
        </tr>
      `).join("");
    }

    // Busca Alunos
    const resAlunos = await fetch("http://localhost:3000/alunos");
    const alunos = await resAlunos.json();
    const corpoAlunos = document.querySelector("#tabelaAlunos tbody");
    
    if (corpoAlunos) {
      corpoAlunos.innerHTML = alunos.map(a => `
        <tr>
          <td>${a.matricula}</td>
          <td>${a.nome}</td>
          <td>${a.email}</td>
          <td>${a.serie}</td>
        </tr>
      `).join("");
    }
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    alert("❌ Erro ao conectar com o servidor.");
  }
}



function gerenciarRotas() {
  const hash = window.location.hash || '#novo-livro';
  esconderTudo();

  if (rotas[hash]) {
    const elemento = document.getElementById(rotas[hash]);
    if (elemento) elemento.style.display = "flex";
    
    // Se a rota for listagem, carrega os dados do banco
    if (hash === '#listagem') {
      carregarListagens();
    }
  }
}

window.addEventListener('hashchange', gerenciarRotas);

// ================== CONTROLE DE TELAS ==================
function esconderTudo() {
  document.getElementById("formadd").style.display = "none";
  document.getElementById("formbausca").style.display = "none";
  document.getElementById("addalunocreate").style.display = "none";
  document.getElementById("formdev").style.display = "none";
  document.getElementById("listagemGeral").style.display = "none"; // Adicione esta linha

  
  const areaEmp = document.getElementById("areaEmprestimo");
  if (areaEmp) areaEmp.style.display = "none";
  
  const areaDev = document.getElementById("areaConfirmacaoDevolucao");
  if (areaDev) areaDev.style.display = "none";
}

function addbook() { window.location.hash = 'novo-livro'; }
function addaluno() { window.location.hash = 'novo-aluno'; }
function buscabook() { window.location.hash = 'emprestimo'; }
function devolver() { window.location.hash = 'devolucao'; }

function toggleOutroInput() {
  const select = document.getElementById("CategoriaSelect");
  const divOutro = document.getElementById("outroCategoriaDiv");
  if (select && divOutro) divOutro.style.display = (select.value === "Outro") ? "block" : "none";
}

// ================== COMPONENTES ==================
async function carregarComponentes() {
  try {
    const [h, f] = await Promise.all([fetch("header.html"), fetch("footer.html")]);
    document.getElementById("header-placeholder").innerHTML = await h.text();
    document.getElementById("footer-placeholder").innerHTML = await f.text();
  } catch (err) { console.error("Erro nos componentes:", err); }
}

// ================== DOM READY ==================
document.addEventListener("DOMContentLoaded", () => {
  carregarComponentes();
  gerenciarRotas();

  // --- CADASTRO DE LIVRO ---
  const formBook = document.getElementById("formbook");
  if (formBook) {
    formBook.addEventListener("submit", async (e) => {
      e.preventDefault();
      const catS = document.getElementById("CategoriaSelect").value;
      const catO = document.getElementById("CategoriaOutro").value.trim();
      const data = {
        title: document.getElementById("titlebook").value.trim(),
        author: document.getElementById("authorbook").value.trim(),
        quantidade: parseInt(document.getElementById("quantidadelivro").value),
        category: (catS === "Outro") ? catO : catS
      };
      try {
        const res = await fetch("http://localhost:3000/livros", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error();
        alert("✅ Livro cadastrado!");
        formBook.reset();
      } catch (err) { alert("❌ Erro ao cadastrar livro"); }
    });
  }

  // --- BUSCA PARA DEVOLUÇÃO (O QUE ESTAVA FALTANDO) ---
const inputDev = document.getElementById("searchDevolucao");
const listDev = document.getElementById("suggestionsDevolucao");
const areaDev = document.getElementById("areaConfirmacaoDevolucao");

if (inputDev) {
  inputDev.addEventListener("input", async () => {
    const q = inputDev.value.trim();
    listDev.innerHTML = ""; // Limpa a lista anterior
    areaDev.style.display = "none"; // Esconde detalhes se mudar a busca

    if (q.length < 2) return;

    try {
      const res = await fetch(`http://localhost:3000/livros?q=${q}`);
      const books = await res.json();
      
      // Para testes, mostramos todos. No futuro, use .filter(b => b.emprestador)
      books.forEach(book => {
        const li = document.createElement("li");
        li.innerHTML = `<span>📙</span> ${book.title} <strong>(ID: ${book.idbook})</strong>`;
        
        li.onclick = () => {
          inputDev.value = book.title;
          listDev.innerHTML = "";
          areaDev.style.display = "block";
          
          document.getElementById("devTitulo").textContent = book.title;
          document.getElementById("idLivroDevolucao").value = book.idbook;
          
          // Preenche dados fictícios ou busca no banco quem está com o livro
          document.getElementById("devAluno").textContent = "Aluno Teste";
          document.getElementById("devData").textContent = new Date().toLocaleDateString();
        };
        listDev.appendChild(li);
      });
    } catch (err) { 
      console.error("Erro na busca de devolução:", err); 
    }
  });
}

  // --- BOTÃO DE CONFIRMAR DEVOLUÇÃO ---
  const btnDevFinal = document.getElementById("devlivro");
  if (btnDevFinal) {
    btnDevFinal.addEventListener("click", async () => {
      const id = document.getElementById("idLivroDevolucao").value;
      try {
        const res = await fetch(`http://localhost:3000/devolver/${id}`, { method: "PATCH" });
        if (!res.ok) throw new Error();
        alert("✅ Livro devolvido com sucesso!");
        window.location.reload();
      } catch (err) { alert("❌ Erro na devolução"); }
    });
  }
  
  // --- LÓGICA DE EMPRÉSTIMO (EXISTENTE) ---
  const inputBusca = document.getElementById("searchBook");
  const listSugestoes = document.getElementById("suggestions");
  const btnLend = document.getElementById("btnLend");
  let selectedBook = null;

  if (inputBusca) {
    inputBusca.addEventListener("input", async () => {
      const value = inputBusca.value.trim();
      listSugestoes.innerHTML = "";
      document.getElementById("areaEmprestimo").style.display = "none";
      if (value.length < 2) return;
      try {
        const res = await fetch(`http://localhost:3000/livros?q=${value}`);
        const books = await res.json();
        books.forEach(book => {
          const li = document.createElement("li");
          li.textContent = `${book.title} (ID: ${book.idbook})`;
          li.onclick = () => {
            inputBusca.value = book.title;
            listSugestoes.innerHTML = "";
            document.getElementById("areaEmprestimo").style.display = "block";
            document.getElementById("detalheAutor").textContent = book.author;
            document.getElementById("detalheCategoria").textContent = book.category;
            document.getElementById("detalheStatus").textContent = book.emprestador ? "🔴 Emprestado" : "🟢 Disponível";
            btnLend.style.display = book.emprestador ? "none" : "block";
            selectedBook = book;
          };
          listSugestoes.appendChild(li);
        });
      } catch (err) { console.error(err); }
    });
  }
});