let messages = [];
let weeklyAccesses = {
  labels: ['29/05', '30/05', '31/05', '01/06', '02/06', '03/06', '04/06'],
  data: [15, 22, 18, 25, 30, 28, 35]
};
let usersOnlineCount = 0;
let accessChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  await carregarDados();

  // Atualiza usuários online e acessos a cada 10 segundos
  setInterval(() => {
    // Usuários online aleatório entre 1 e 30
    usersOnlineCount = Math.floor(Math.random() * 30) + 1;
    document.getElementById('usersOnline').textContent = usersOnlineCount;

    // Acessos semanais aleatórios
    weeklyAccesses.data = weeklyAccesses.data.map(() => Math.floor(Math.random() * 40) + 10);
    document.getElementById('totalAccesses').textContent = weeklyAccesses.data.reduce((a, b) => a + b, 0);

    renderAccessBarChart();
  }, 10000);

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    window.location.href = 'login.html';
  });
});

async function carregarDados() {
  try {
    // Buscar mensagens do backend
    const msgRes = await fetch('./get-mensagens.php');
    messages = await msgRes.json();

    // Preencher métricas
    document.getElementById('totalMessages').textContent = messages.length;
    document.getElementById('totalAccesses').textContent = weeklyAccesses.data.reduce((a, b) => a + b, 0);
    usersOnlineCount = Math.floor(Math.random() * 30) + 1;
    document.getElementById('usersOnline').textContent = usersOnlineCount;

    // Inicializar tabela e gráfico
    initializeMessageTable();
    renderAccessBarChart();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
}

function initializeMessageTable() {
  const tableBody = document.querySelector('#messageTable tbody');
  tableBody.innerHTML = '';

  messages.forEach((msg) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${msg.nome || msg.name || ''}</td>
      <td>${msg.email || ''}</td>
      <td>${msg.assunto || msg.subject || ''}</td>
      <td>${msg.mensagem || msg.message || ''}</td>
    `;
    tableBody.appendChild(row);
  });

  // Destroi DataTable antigo se já existir
  if ($.fn.DataTable.isDataTable('#messageTable')) {
    $('#messageTable').DataTable().destroy();
  }

  // Inicializa DataTable
  $('#messageTable').DataTable({
    responsive: true,
    pageLength: 5,
    lengthMenu: [5, 10, 20],
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/Portuguese-Brasil.json'
    }
  });
}

function renderAccessBarChart() {
  const ctx = document.getElementById('accessChart').getContext('2d');
  if (accessChartInstance) {
    accessChartInstance.destroy();
  }
  accessChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weeklyAccesses.labels,
      datasets: [
        {
          label: 'Acessos Diários',
          data: weeklyAccesses.data,
          backgroundColor: 'rgba(56, 142, 60, 0.6)',
          borderColor: 'rgba(56, 142, 60, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 5
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return ` ${context.parsed.y} acessos`;
            }
          }
        }
      }
    }
  });
}



function initializeMessageTable() {
  const tableBody = document.querySelector('#messageTable tbody');
  tableBody.innerHTML = '';

  messages.forEach((msg, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${msg.nome || msg.name || ''}</td>
      <td>${msg.email || ''}</td>
      <td>${msg.assunto || msg.subject || ''}</td>
      <td class="msg-cell" data-index="${idx}" style="cursor:pointer; color:#1976D2; text-decoration:underline;">
        ${msg.mensagem || msg.message || ''}
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Destroi DataTable antigo se já existir
  if ($.fn.DataTable.isDataTable('#messageTable')) {
    $('#messageTable').DataTable().destroy();
  }

  // Inicializa DataTable
  $('#messageTable').DataTable({
    responsive: true,
    pageLength: 5,
    lengthMenu: [5, 10, 20],
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/Portuguese-Brasil.json'
    }
  });

  // Adiciona evento para expandir mensagem
  document.querySelectorAll('.msg-cell').forEach(cell => {
    cell.addEventListener('click', function() {
      const idx = this.getAttribute('data-index');
      const mensagemCompleta = messages[idx].mensagem || messages[idx].message || '';
      abrirModalMensagem(mensagemCompleta);
    });
  });
}

// Modal simples para exibir mensagem completa
function abrirModalMensagem(texto) {
  // Remove modal antigo se existir
  const antigo = document.getElementById('modalMensagem');
  if (antigo) antigo.remove();

  const modal = document.createElement('div');
  modal.id = 'modalMensagem';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.5)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '9999';

  modal.innerHTML = `
    <div style="background:#fff; padding:2rem; border-radius:12px; max-width:90vw; max-height:80vh; overflow:auto; box-shadow:0 4px 24px rgba(0,0,0,0.2); position:relative;">
      <button onclick="document.getElementById('modalMensagem').remove()" style="position:absolute; top:10px; right:10px; background:#e53935; color:#fff; border:none; border-radius:50%; width:32px; height:32px; font-size:1.5rem; cursor:pointer;">×</button>
      <h3 style="margin-bottom:1rem;">Mensagem Completa</h3>
      <div style="white-space:pre-wrap; font-size:1.1rem; color:#333;">${texto}</div>
    </div>
  `;
  document.body.appendChild(modal);
}
