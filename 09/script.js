// Seletores
const form = document.getElementById('add-form');
const input = document.getElementById('titulo');
const dataInput = document.getElementById('data');
const categoriaSelect = document.getElementById('categoria');
const taskList = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');
const themeToggle = document.getElementById('toggle-theme');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('search');
const exportBtn = document.getElementById('export-json');
const alertVencimento = document.getElementById('alert-vencimento');

// Sons
const soundComplete = document.getElementById('sound-complete');
const soundAlert = document.getElementById('sound-alert');

// Estado
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
let currentFilter = 'all';
let draggedItem = null;

// Mapeamento de categorias
const categorias = {
  trabalho: '💼 Trabalho',
  estudo: '📚 Estudo',
  pessoal: '🏠 Pessoal',
  saude: '💪 Saúde'
};

// Modo escuro
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark')
    ? '☀️ Modo Claro'
    : '🌙 Modo Escuro';
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
});

if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
  themeToggle.textContent = '☀️ Modo Claro';
}

// Adicionar tarefa
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const titulo = input.value.trim();
  const data = dataInput.value;
  const categoria = categoriaSelect.value;

  if (titulo) {
    const novaTarefa = {
      id: Date.now(),
      titulo,
      data,
      categoria,
      concluida: false
    };
    tarefas.push(novaTarefa);
    salvarTarefas();
    atualizarInterface();
    input.value = '';
    dataInput.value = '';
    categoriaSelect.value = '';
  }
});

// Atualizar tudo
function atualizarInterface() {
  renderizarTarefas();
  verificarVencimentos();
}

// Renderizar com filtros e busca
function renderizarTarefas() {
  const termo = searchInput.value.toLowerCase();
  let tarefasFiltradas = tarefas.filter(t =>
    t.titulo.toLowerCase().includes(termo)
  );

  if (currentFilter === 'active') {
    tarefasFiltradas = tarefasFiltradas.filter(t => !t.concluida);
  } else if (currentFilter === 'completed') {
    tarefasFiltradas = tarefasFiltradas.filter(t => t.concluida);
  }

  taskList.innerHTML = '';
  if (tarefasFiltradas.length === 0) {
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';
    tarefasFiltradas.forEach(tarefa => {
      const li = criarItemTarefa(tarefa);
      taskList.appendChild(li);
    });
  }
}

function criarItemTarefa(tarefa) {
  const li = document.createElement('li');
  li.className = `task-item ${tarefa.concluida ? 'completed' : ''}`;
  li.dataset.id = tarefa.id;
  li.draggable = true;

  const dataFormatada = tarefa.data
    ? new Date(tarefa.data).toLocaleDateString('pt-BR')
    : '';

  const tag = tarefa.categoria
    ? `<span class="task-tag tag-${tarefa.categoria}">${categorias[tarefa.categoria]}</span>`
    : '';

  li.innerHTML = `
    <div class="task-content">
      ${tag}
      <span class="task-title">${tarefa.titulo}</span>
      ${dataFormatada ? `<div class="task-info">Vence: ${dataFormatada}</div>` : ''}
    </div>
    <div class="task-actions">
      <button class="btn toggle" data-id="${tarefa.id}">
        ${tarefa.concluida ? 'Desfazer' : 'Concluir'}
      </button>
      <button class="btn delete" data-id="${tarefa.id}">Excluir</button>
    </div>
  `;

  return li;
}

// Filtros
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderizarTarefas();
  });
});

// Busca
searchInput.addEventListener('input', renderizarTarefas);

// Eventos na lista
taskList.addEventListener('click', (e) => {
  const id = Number(e.target.dataset.id);

  if (e.target.classList.contains('toggle')) {
    tarefas = tarefas.map(t => {
      if (t.id === id) {
        const nova = { ...t, concluida: !t.concluida };
        if (nova.concluida) soundComplete.play().catch(() => {});
        return nova;
      }
      return t;
    });
    salvarTarefas();
    atualizarInterface();
  }

  if (e.target.classList.contains('delete')) {
    tarefas = tarefas.filter(t => t.id !== id);
    salvarTarefas();
    atualizarInterface();
  }
});

// Verificar vencimentos (dentro de 2 dias)
function verificarVencimentos() {
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(hoje.getDate() + 2);

  const vencendo = tarefas.filter(t => {
    if (!t.data || t.concluida) return false;
    const dataTarefa = new Date(t.data);
    return dataTarefa >= hoje && dataTarefa <= limite;
  });

  if (vencendo.length > 0) {
    alertVencimento.textContent = `🔔 ${vencendo.length} tarefa(s) vencendo em breve!`;
    alertVencimento.className = 'alert warning';
    alertVencimento.classList.remove('hidden');
    soundAlert.play().catch(() => {});
  } else {
    alertVencimento.classList.add('hidden');
  }
}

// Exportar como JSON
exportBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(tarefas, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tarefas_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Arraste e solte (mantido)
taskList.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('task-item')) {
    draggedItem = e.target;
    e.target.classList.add('dragging');
  }
});

taskList.addEventListener('dragover', (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(taskList, e.clientY);
  if (afterElement == null) {
    taskList.appendChild(draggedItem);
  } else {
    taskList.insertBefore(draggedItem, afterElement);
  }
});

taskList.addEventListener('drop', () => {
  if (draggedItem) {
    draggedItem.classList.remove('dragging');
    const idsNaTela = Array.from(taskList.children).map(el => Number(el.dataset.id));
    tarefas.sort((a, b) => idsNaTela.indexOf(a.id) - idsNaTela.indexOf(b.id));
    salvarTarefas();
    draggedItem = null;
  }
});

taskList.addEventListener('dragend', () => {
  if (draggedItem) draggedItem.classList.remove('dragging');
  draggedItem = null;
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Funções de persistência
function salvarTarefas() {
  localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// Inicialização
atualizarInterface();
setInterval(verificarVencimentos, 30000); // Verifica a cada 30 segundos