// Setas da navbar: a lista de itens é mais larga que a tela em vários
// tamanhos de desktop, então em vez de deixar o overflow:hidden do .navbar
// cortar os botões das pontas, a lista rola horizontalmente e as setas
// empurram esse scroll.
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.navbar');
  if (!nav) return;

  const lista = nav.querySelector('ul');
  const btnEsquerda = document.getElementById('navbarArrowLeft');
  const btnDireita = document.getElementById('navbarArrowRight');
  if (!lista || !btnEsquerda || !btnDireita) return;

  const PASSO = 220; // ~largura de um item do menu (180px + padding)

  btnEsquerda.addEventListener('click', () => {
    lista.scrollBy({ left: -PASSO, behavior: 'smooth' });
  });

  btnDireita.addEventListener('click', () => {
    lista.scrollBy({ left: PASSO, behavior: 'smooth' });
  });
});
