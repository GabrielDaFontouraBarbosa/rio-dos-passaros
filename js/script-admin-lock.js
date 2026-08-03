// Estado do cadeado do admin: compartilhado pelas abas Métricas e Mapa de
// Anúncios (mesmo PIN, mesma sessão de página). Só existe em memória — não
// grava em cookie nem em localStorage, então some ao recarregar a página.
const AdminLock = (() => {
  const DURACAO_INATIVIDADE_MS = 15 * 60 * 1000;
  let desbloqueado = false;
  let timeoutInatividade = null;
  const ouvintes = new Set();

  function notificar() {
    ouvintes.forEach((fn) => fn(desbloqueado));
  }

  function resetarInatividade() {
    if (!desbloqueado) return;
    clearTimeout(timeoutInatividade);
    timeoutInatividade = setTimeout(trancar, DURACAO_INATIVIDADE_MS);
  }

  async function trancar() {
    if (!desbloqueado) return;
    desbloqueado = false;
    clearTimeout(timeoutInatividade);
    notificar();
    try {
      await fetch('./trancar.php', { method: 'POST' });
    } catch (e) {
      // sem problema: a sessão no servidor também expira sozinha em 15min
    }
  }

  function destrancar() {
    desbloqueado = true;
    resetarInatividade();
    notificar();
  }

  function estaDesbloqueado() {
    return desbloqueado;
  }

  function aoMudar(fn) {
    ouvintes.add(fn);
    fn(desbloqueado);
    return () => ouvintes.delete(fn);
  }

  ['mousemove', 'keydown', 'click', 'touchstart'].forEach((evento) => {
    document.addEventListener(evento, resetarInatividade, { passive: true });
  });

  return { destrancar, trancar, estaDesbloqueado, aoMudar };
})();

document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('modalPin');
  if (!modalEl || typeof bootstrap === 'undefined') return;

  const modalBootstrap = new bootstrap.Modal(modalEl);
  const inputs = Array.from(modalEl.querySelectorAll('.pin-digito'));
  const erroEl = document.getElementById('pinErro');
  const grupoInputs = document.getElementById('pinGrupoInputs');
  let enviando = false;
  let timerBloqueio = null;

  function mostrarToast(mensagem) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-bg-success border-0';
    toastEl.setAttribute('role', 'status');
    toastEl.innerHTML = `<div class="d-flex"><div class="toast-body">${mensagem}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
    container.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }

  function limparCampos() {
    inputs.forEach((i) => {
      i.value = '';
      i.classList.remove('is-invalid');
    });
    inputs[0].focus();
  }

  function balancarCampos() {
    inputs.forEach((i) => {
      i.classList.add('pin-shake', 'is-invalid');
    });
    setTimeout(() => inputs.forEach((i) => i.classList.remove('pin-shake')), 400);
  }

  function definirCamposHabilitados(habilitado) {
    inputs.forEach((i) => (i.disabled = !habilitado));
  }

  function iniciarContagemBloqueio(segundos) {
    clearInterval(timerBloqueio);
    definirCamposHabilitados(false);
    let restante = segundos;
    const atualizar = () => {
      erroEl.textContent = `Muitas tentativas erradas. Tente de novo em ${restante}s.`;
      if (restante <= 0) {
        clearInterval(timerBloqueio);
        definirCamposHabilitados(true);
        erroEl.textContent = '';
        limparCampos();
        return;
      }
      restante -= 1;
    };
    atualizar();
    timerBloqueio = setInterval(atualizar, 1000);
  }

  async function tentarValidar() {
    if (enviando) return;
    const pin = inputs.map((i) => i.value).join('');
    if (pin.length < 4) return;
    enviando = true;
    erroEl.textContent = '';

    try {
      const res = await fetch('./verificar-pin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const dados = await res.json();

      if (dados.ok) {
        AdminLock.destrancar();
        modalBootstrap.hide();
        mostrarToast('Edição liberada.');
      } else if (dados.bloqueado) {
        balancarCampos();
        iniciarContagemBloqueio(dados.segundosRestantes);
      } else {
        erroEl.textContent = dados.erro || 'PIN incorreto.';
        balancarCampos();
        limparCampos();
      }
    } catch (e) {
      erroEl.textContent = 'Não foi possível verificar o PIN agora. Tente de novo.';
    } finally {
      enviando = false;
    }
  }

  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      if (input.value && idx < inputs.length - 1) inputs[idx + 1].focus();
      if (inputs.every((i) => i.value)) tentarValidar();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const texto = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 4);
      texto.split('').forEach((d, i) => {
        if (inputs[i]) inputs[i].value = d;
      });
      const proximo = inputs[Math.min(texto.length, inputs.length - 1)];
      proximo.focus();
      if (texto.length === 4) tentarValidar();
    });
  });

  modalEl.addEventListener('shown.bs.modal', () => {
    clearInterval(timerBloqueio);
    definirCamposHabilitados(true);
    erroEl.textContent = '';
    limparCampos();
  });

  // Botões de cadeado (um por aba) e de "Trancar agora"
  document.querySelectorAll('[data-abrir-cadeado]').forEach((btn) => {
    btn.addEventListener('click', () => modalBootstrap.show());
  });
  document.querySelectorAll('[data-trancar-agora]').forEach((btn) => {
    btn.addEventListener('click', () => AdminLock.trancar());
  });

  // Sincroniza o ícone/estado visual de cada aba com o estado compartilhado
  function sincronizarUI(desbloqueado) {
    document.querySelectorAll('[data-cadeado-icone]').forEach((el) => {
      el.textContent = desbloqueado ? '🔓' : '🔒';
      el.closest('[data-cadeado-container]')?.classList.toggle('cadeado-aberto', desbloqueado);
    });
    document.querySelectorAll('[data-abrir-cadeado]').forEach((el) => {
      el.hidden = desbloqueado;
      el.setAttribute('aria-label', 'Cadeado trancado. Clique para destrancar com o PIN.');
    });
    document.querySelectorAll('[data-trancar-agora]').forEach((el) => {
      el.hidden = !desbloqueado;
      el.setAttribute('aria-label', 'Cadeado destrancado. Clique para trancar agora.');
    });
    document.body.classList.toggle('admin-desbloqueado', desbloqueado);
  }

  AdminLock.aoMudar(sincronizarUI);
});
