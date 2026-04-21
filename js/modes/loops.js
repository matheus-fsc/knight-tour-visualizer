// Modo "Loops" — anima um ciclo fundamental por vez.

const state = {
  idx: 0,
  anim: 0,
  rafId: null,
  paused: false,
};

export default {
  key: 'loops',
  label: 'Loops',
  note: `
    <b>O que é um loop?</b> Um caminho que sai de uma casa e volta a ela
    sem repetir passos — formando um círculo fechado.
    O grafo do cavalo 8×8 tem <b>105 loops básicos</b>, chamados de
    "ciclos fundamentais". Todos os outros loops possíveis são combinações destes.
    <br><br>
    Aqui cada loop é revelado em duas partes: caminho
    <span style="color:#ff8a6b">laranja</span> e caminho
    <span style="color:#66c8ff">azul</span>, que se encontram na aresta
    <span style="color:#ffd66b">amarela</span> (a "colisão" que fecha o ciclo).
  `,

  onEnter(app) {
    state.idx = 0;
    state.anim = 0;
    state.paused = false;
    this.renderPanel(app);
    this.tick(app);
  },

  onExit() {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  },

  render(app) {
    const { board, DATA } = app;
    board.drawBoard();
    board.drawNodes(DATA.descricao.graus, { dim: true, labels: false });
    const loop = DATA.loops[state.idx];
    if (!loop) return;

    const p1 = loop.caminho1, p2 = loop.caminho2;
    const total = p1.length + p2.length;
    const revealed = Math.floor(state.anim * (total + 8));
    const n1 = Math.min(p1.length, revealed);
    const n2 = Math.min(p2.length, Math.max(0, revealed - p1.length));

    if (n1 > 0) board.drawPath(p1.slice(0, n1), { color: '#ff8a6b', width: 3 });
    if (n2 > 0) board.drawPath(p2.slice(0, n2), { color: '#66c8ff', width: 3 });

    if (revealed >= total) {
      board.drawEdge(loop.colisao[0], loop.colisao[1],
        { color: '#ffd66b', width: 3, dash: [7, 5] });
    }
  },

  tick(app) {
    if (!state.paused) {
      state.anim += app.speed() / 4500;
      if (state.anim >= 1.35) {
        state.anim = 0;
        state.idx = (state.idx + 1) % app.DATA.loops.length;
        this._updatePanel(app);
      }
    }
    this.render(app);
    if (app.currentMode === this) {
      state.rafId = requestAnimationFrame(() => this.tick(app));
    }
  },

  // Atualiza apenas as partes dinâmicas do painel sem recriar o botão
  _updatePanel(app) {
    const { DATA } = app;
    document.getElementById('s-p').textContent =
      `${state.idx + 1}/${DATA.loops.length}`;
    document.getElementById('s-active').textContent = `#${state.idx + 1}`;
    const loop = DATA.loops[state.idx] || {};
    const coll = loop.colisao
      ? `(${loop.colisao[0][0]},${loop.colisao[0][1]}) ↔ ` +
        `(${loop.colisao[1][0]},${loop.colisao[1][1]})`
      : '—';
    const sz = document.getElementById('lp-size');
    const cl = document.getElementById('lp-coll');
    if (sz) sz.textContent = `${loop.tamanho_ciclo || '—'} passos`;
    if (cl) cl.textContent = coll;
  },

  renderPanel(app) {
    const { DATA } = app;
    document.getElementById('s-p').textContent =
      `${state.idx + 1}/${DATA.loops.length}`;
    document.getElementById('s-active').textContent = `#${state.idx + 1}`;
    const loop = DATA.loops[state.idx] || {};
    const coll = loop.colisao
      ? `(${loop.colisao[0][0]},${loop.colisao[0][1]}) ↔ ` +
        `(${loop.colisao[1][0]},${loop.colisao[1][1]})`
      : '—';
    document.getElementById('mode-panel').innerHTML = `
      <h2>Loop atual</h2>
      <div class="stat">
        <span class="stat-label">Tamanho do ciclo</span>
        <span class="stat-value" id="lp-size">${loop.tamanho_ciclo || '—'} passos</span>
      </div>
      <div class="stat">
        <span class="stat-label">Colisão</span>
        <span class="stat-value" id="lp-coll">${coll}</span>
      </div>
      <div style="display:flex; gap:5px; margin: 10px 0;">
        <button id="btn-lp-pp" style="flex:1">
          ${state.paused ? '▶ Play' : '⏸ Pausar'}
        </button>
        <button id="btn-lp-prev">◀ Anterior</button>
        <button id="btn-lp-next">Próximo ▶</button>
      </div>
      <div class="panel-intro">
        Cada aresta fora da árvore geradora (veja o modo "Árvore") fecha
        exatamente <b>um</b> loop fundamental. Por isso são <b>105 loops</b>
        (as 105 arestas extras).
      </div>
    `;
    document.getElementById('btn-lp-pp').onclick = () => {
      state.paused = !state.paused;
      const b = document.getElementById('btn-lp-pp');
      if (b) b.textContent = state.paused ? '▶ Play' : '⏸ Pausar';
    };
    document.getElementById('btn-lp-prev').onclick = () => {
      state.anim = 0;
      state.idx = (state.idx - 1 + app.DATA.loops.length) % app.DATA.loops.length;
      this._updatePanel(app);
    };
    document.getElementById('btn-lp-next').onclick = () => {
      state.anim = 0;
      state.idx = (state.idx + 1) % app.DATA.loops.length;
      this._updatePanel(app);
    };
  },
};
