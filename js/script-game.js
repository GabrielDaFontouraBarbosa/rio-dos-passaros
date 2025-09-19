(() => {
  // DOM
  const canvas = document.getElementById('flappyTieCanvas');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('startFlappyBtn');
  const scoreEl = document.getElementById('flappyScore');
  const pauseBtn = document.getElementById('pauseBtn');
  const overlayText = document.createElement('div');

  overlayText.className = 'canvas-overlay-text';
  overlayText.id = 'canvasOverlayText';
  overlayText.innerText = 'Pausado';
  canvas.parentElement.appendChild(overlayText);

  // Assets
  const tieSangueImg = new Image(); tieSangueImg.src = 'images/tiesangue.png';
  const bgImg = new Image(); bgImg.src = 'images/cenarioteste2.png';
  const plankImg = new Image(); plankImg.src = 'images/plank.png';

  // HiDPI handling
  let DPR = Math.max(1, window.devicePixelRatio || 1);
  let canvasW = 360;
  let canvasH = 540;

  // Mobile-friendly resize: usa bounding client rect (CSS controls visual size)
  function fitCanvasToDisplay() {
    // pega tamanho CSS do elemento (definido no seu CSS responsivo)
    const rect = canvas.getBoundingClientRect();
    // fallback para casos estranhos
    const cssW = (rect.width && rect.width > 10) ? rect.width : Math.min(window.innerWidth * 0.95, 520);
    const cssH = (rect.height && rect.height > 10) ? rect.height : Math.min(window.innerHeight * 0.6, cssW * 1.6);
    DPR = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssW * DPR);
    canvas.height = Math.round(cssH * DPR);
    // deixar contexto com escala para coordenadas CSS
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    canvasW = cssW;
    canvasH = cssH;
  }

  // Game constants (fáceis de ajustar)
  const TIE_W = 48, TIE_H = 48;
  const GRAVITY = 0.36;
  const FLAP = -9;
  const MAX_FALL_SPEED = 10;
  let PIPE_W = 88;             // ajuste para largura da plank
  let INITIAL_PIPE_GAP = 180;
  let INITIAL_PIPE_SPEED = 2.6;
  const SPAWN_INTERVAL = 1400;
  const GROUND_PADDING = 0;
  let bgX = 0;
  const BG_SPEED = 1.0;

  // Tronco/plank fixo
  let TRUNK_H = 150;           // altura visível do "tronco" (plank) - ajuste conforme imagem
  const SUBMERGE_PCT = 0.45;   // porcentagem do tronco inferior que fica submersa (0..1)
                               // ex: 0.45 => 45% da altura do tronco ficará "fora da tela" (submersa)

  // State
  let state = 'ready';
  let tieX = 100, tieY = 200, velY = 0;
  let pipes = [], lastSpawn = 0, score = 0, pipeSpeed = INITIAL_PIPE_SPEED, pipeGap = INITIAL_PIPE_GAP;
  let lastTime = 0, rafId = null;
  let lastGameOverAt = 0, RESTART_BLOCK_MS = 250;
  const FRAME_BASE = 1000/60;
  let paused = false;

  // helpers para ajustar dinamicamente (expostos no window)
  function setPipeWidth(w){ PIPE_W = Math.max(32, Math.round(w)); }
  function setTrunkHeight(h){ TRUNK_H = Math.max(20, Math.round(h)); }
  function setSubmergePct(p){ SUBMERGE_PCT = Math.min(0.9, Math.max(0, p)); } // note: SUBMERGE_PCT const redefined below if needed

  function resetGame() {
    pipes = []; score = 0; pipeSpeed = INITIAL_PIPE_SPEED; pipeGap = INITIAL_PIPE_GAP;
    velY = 0; tieX = Math.round(canvasW * 0.28); tieY = Math.round(canvasH * 0.4);
    lastSpawn = performance.now() + 300; bgX = 0; state = 'ready'; lastGameOverAt = 0;
    updateScoreDOM();
    startBtn.innerText = 'Jogar!';
  }

  function startGame() {
    resetGame();
    state = 'playing';
    lastTime = performance.now();
    if (!rafId) loop(lastTime);
    startBtn.innerText = 'Reiniciar';
  }

  function gameOver() {
    if (state !== 'gameover') {
      state = 'gameover';
      lastGameOverAt = performance.now();
      startBtn.innerText = 'Reiniciar';
    }
  }

  function flap() {
    if (state === 'ready') {
      startGame();
      velY = FLAP * 0.9;
      return;
    }
    if (state === 'playing') {
      velY = FLAP;
      return;
    }
    const now = performance.now();
    if (now - lastGameOverAt > RESTART_BLOCK_MS) startGame();
  }

  // Events (usar somente pointer para evitar duplo trigger mobile)
  canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); flap(); }, { passive:false });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); flap(); }
    if (e.code === 'KeyP') { togglePause(); }
  });
  startBtn.addEventListener('click', (e) => { e.preventDefault(); if (state === 'playing') { resetGame(); startGame(); } else startGame(); });
  if (pauseBtn) pauseBtn.addEventListener('click', togglePause);

  window.addEventListener('resize', () => {
    fitCanvasToDisplay();
    tieY = Math.min(Math.max(0, tieY), canvasH - TIE_H);
    draw();
  });

  function togglePause() {
    if (state !== 'playing') return;
    paused = !paused;
    overlayText.style.display = paused ? 'block' : 'none';
    if (!paused) lastTime = performance.now();
  }

  function spawnPipe() {
    // Garantimos espaço para tronco fixo em cima e embaixo
    const margin = 18;
    // gapY representa a altura do topo (p.gapY)
    const minGapTop = TRUNK_H + margin;
    const maxGapTop = canvasH - (TRUNK_H + margin) - pipeGap;
    const safeMax = Math.max(minGapTop, maxGapTop);
    const gapY = Math.floor(minGapTop + Math.random() * Math.max(1, safeMax - minGapTop));
    const x = canvasW + 20;
    pipes.push({ x, gapY, passed:false });
  }

  function rectsIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
    return !(bx > ax + aw || bx + bw < ax || by > ay + ah || by + bh < ay);
  }

  function update(dt) {
    if (state !== 'playing' || paused) return;
    const frameScale = dt / FRAME_BASE;
    velY += GRAVITY * frameScale;
    if (velY > MAX_FALL_SPEED) velY = MAX_FALL_SPEED;
    tieY += velY * frameScale;

    // background scroll
    bgX -= BG_SPEED * frameScale;

    // spawn pipes
    const now = performance.now();
    if (now - lastSpawn > SPAWN_INTERVAL) { spawnPipe(); lastSpawn = now; }

    // move pipes + scoring
    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= pipeSpeed * frameScale;
      if (!p.passed && (p.x + PIPE_W) < tieX) {
        p.passed = true; score += 1; updateScoreDOM();
        if (score % 6 === 0) { pipeSpeed += 0.2; pipeGap = Math.max(140, pipeGap - 6); }
      }
      if (p.x + PIPE_W < -20) pipes.splice(i,1);
    }

    // collisions
    const tieRect = { x: tieX + 4, y: tieY + 4, w: TIE_W - 8, h: TIE_H - 8 };
    for (const p of pipes) {
      // top collision area (normal)
      const topRect = { x: p.x, y:0, w: PIPE_W, h: p.gapY };

      // bottom: removemos a parte "submersa" da colisão, usando SUBMERGE_PCT
      const drawBottomH = Math.round(canvasH - (p.gapY + pipeGap)); // total disponível para desenho do bottom (antes de limitar por TRUNK_H)
      // altura efetiva do tronco desenhado (limitada por TRUNK_H)
      const trunkH = Math.min(TRUNK_H, drawBottomH);
      const submergedPx = Math.round(trunkH * SUBMERGE_PCT); // pixels "fora" / submersos (ignorados na colisão)
      // bottom collision rect começa no gapY+pipeGap + submergedPx e vai até o fim visível
      const bottomRect = {
        x: p.x,
        y: p.gapY + pipeGap + submergedPx,
        w: PIPE_W,
        h: canvasH - (p.gapY + pipeGap) - GROUND_PADDING - submergedPx
      };

      if (rectsIntersect(tieRect.x, tieRect.y, tieRect.w, tieRect.h, topRect.x, topRect.y, topRect.w, topRect.h)
          || rectsIntersect(tieRect.x, tieRect.y, tieRect.w, tieRect.h, bottomRect.x, bottomRect.y, bottomRect.w, bottomRect.h)) {
        gameOver(); break;
      }
    }

    if (tieY <= -TIE_H || (tieY + TIE_H) >= (canvasH - GROUND_PADDING)) gameOver();
    if (tieY < -TIE_H) tieY = -TIE_H;
    if (tieY > canvasH) tieY = canvasH;
  }

  // Draw helpers
  function drawBackground() {
    if (bgImg.complete && bgImg.naturalWidth !== 0) {
      const bgW = bgImg.naturalWidth;
      const bgH = bgImg.naturalHeight;
      const scale = canvasH / bgH;
      const drawW = bgW * scale;
      const drawH = canvasH;

      const x1 = Math.round(bgX);
      const x2 = Math.round(bgX + drawW);

      ctx.drawImage(bgImg, x1, 0, drawW, drawH);
      ctx.drawImage(bgImg, x2, 0, drawW, drawH);

      if (bgX <= -drawW) bgX += drawW;
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, canvasH);
      g.addColorStop(0, '#415e67ff');
      g.addColorStop(1, '#e6fff9');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }
  }

  // ...existing code...
function drawPipes() {
  ctx.save();
  for (const p of pipes) {
    const topH = Math.round(p.gapY);
    const bottomY = Math.round(p.gapY + pipeGap);
    const bottomTotalH = Math.round(canvasH - (p.gapY + pipeGap) - GROUND_PADDING);
    const x = Math.round(p.x);

    if ((plankImg.complete && plankImg.naturalWidth !== 0)) {
      // --- TOPO: desenha plank invertida (ancorada no topo)
      const trunkTopH = Math.min(TRUNK_H, topH);
      if (trunkTopH > 2) {
        ctx.save();
        ctx.translate(x, -18);
        ctx.scale(1, -1); // inverte verticalmente
        ctx.drawImage(plankImg, 0, -trunkTopH, PIPE_W, trunkTopH);
        ctx.restore();
      }

      // (REMOVIDO) área de preenchimento entre tronco fixo e gap
      // if (topH > trunkTopH) { ctx.fillStyle = 'rgba(60,100,60,0.12)'; ctx.fillRect(x, trunkTopH, PIPE_W, topH - trunkTopH); }

      // --- BASE: desenha plank ancorada na base, mas deslocada pra baixo (submersa)
      const trunkBottomH = Math.min(TRUNK_H, bottomTotalH);
      const submergedPx = Math.round(trunkBottomH * SUBMERGE_PCT);
      const drawY = canvasH - trunkBottomH + submergedPx;
      if (trunkBottomH > 2) {
        ctx.drawImage(plankImg, x, drawY, PIPE_W, trunkBottomH);
      }

      // (REMOVIDO) preenchimento entre gap e início do tronco inferior
      // const visibleTrunkTopY = canvasH - trunkBottomH + submergedPx;
      // if ((bottomY) < visibleTrunkTopY) {
      //   ctx.fillStyle = 'rgba(60,90,60,0.12)';
      //   ctx.fillRect(x, bottomY, PIPE_W, Math.max(0, visibleTrunkTopY - bottomY));
      // }
    } else {
      // fallback (mantém os canos visíveis quando não há imagem)
      ctx.fillStyle = '#6b8f4a'; ctx.fillRect(x, 0, PIPE_W, topH);
      ctx.fillStyle = '#476b3b'; ctx.fillRect(x, bottomY, PIPE_W, bottomTotalH);
    }

    // sombra leve interna (mantém visual sem criar "barra verde" forte)
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(x + 6, Math.max(4, Math.round(topH * 0.25)), 6, Math.max(2, Math.round(Math.max(4, topH) * 0.12)));
  }
  ctx.restore();
}


  function drawTie() {
    if (tieSangueImg.complete && tieSangueImg.naturalWidth !== 0) {
      ctx.drawImage(tieSangueImg, Math.round(tieX), Math.round(tieY), TIE_W, TIE_H);
    } else {
      ctx.save();
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(Math.round(tieX), Math.round(tieY), TIE_W, TIE_H);
      ctx.restore();
    }
  }

  function drawScore() {
    ctx.save();
    ctx.font = 'bold 26px "Chaloops", "Luckiest Guy", system-ui, sans-serif';
    ctx.fillStyle = '#073642';
    ctx.textAlign = 'center';
    ctx.fillText(String(score), canvasW * 0.5, 40);
    ctx.restore();
  }

  function drawOverlay() {
    if (state === 'ready') {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.76)';
      ctx.fillRect(canvasW * 0.08, canvasH * 0.28, canvasW * 0.84, canvasH * 0.36);
      ctx.fillStyle = '#0b3a48';
      ctx.font = '22px "Chaloops", "Luckiest Guy", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Clique ou pressione espaço para voar', canvasW * 0.5, canvasH * 0.45);
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText('Toque para iniciar', canvasW * 0.5, canvasH * 0.55);
      ctx.restore();
    } else if (state === 'gameover') {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.48)';
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 34px "Chaloops", "Luckiest Guy", sans-serif';
      ctx.fillText('Game Over', canvasW * 0.5, canvasH * 0.4);
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText(`Score: ${score}`, canvasW * 0.5, canvasH * 0.5);
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('Clique ou pressione Espaço para reiniciar', canvasW * 0.5, canvasH * 0.6);
      ctx.restore();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvasW, canvasH);
    drawBackground();
    drawPipes();
    drawTie();
    drawScore();
    drawOverlay();
  }

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    if (!lastTime) lastTime = now;
    const dt = Math.min(100, now - lastTime);
    lastTime = now;
    update(dt);
    draw();
  }

  function updateScoreDOM() {
    if (scoreEl) scoreEl.innerText = `Score: ${score}`;
  }

  function init() {
    fitCanvasToDisplay();
    resetGame();
    [tieSangueImg, bgImg, plankImg].forEach(img => img.addEventListener('load', draw));
    // evita comportamento de tap highlight no mobile
    canvas.style.touchAction = 'none';
    draw();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') init();
  else window.addEventListener('DOMContentLoaded', init);

  // expose helpers para debug / ajustes rápidos
  window.__flappyTie = {
    resetGame, startGame, gameOver,
    get state(){ return state; },
    get score(){ return score; },
    setDifficulty: (speed, gap) => { pipeSpeed = speed; pipeGap = gap; },
    setPipeWidth, setTrunkHeight
  };

})();
