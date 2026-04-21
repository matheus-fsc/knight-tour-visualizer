// Modo "Fusão GF(2)" — seleção interativa de loops; arestas sobrevivem por XOR (paridade).

const state = {
  active: new Set(),
  animId: null,
  animCursor: -1,
  playing: false,
};

export default {
  key: 'xor',
  label: 'Fusão GF(2)',
  note: `
    <b>Cada loop é um interruptor.</b> Ao ligar dois loops que compartilham
    uma aresta, essa aresta é <b>cancelada</b> (porque 1 + 1 = 0 em GF(2), a
    aritmética binária).
    <br><br>
    Só aparecem as arestas tocadas por um <b>número ímpar</b> de loops ativos.
    Combinando os 105 loops certos, as arestas que sobram formam exatamente
    o <b>passeio do cavalo</b> — é assim que a álgebra resolve o quebra-cabeça.
  `,

  onEnter(app) {
    this.renderPanel(app);
    this.render(app);
  },

  onExit() {
    this._stopAnim();
  },

  _stopAnim() {
    if (state.animId) { clearInterval(state.animId); state.animId = null; }
    state.playing = false;
  },

  // Atualiza um item da lista em-lugar (sem recriar o DOM → scroll preservado)
  _applyToggle(app, id) {
    if (state.active.has(id)) state.active.delete(id);
    else state.active.add(id);
    const el = document.querySelector(`.item[data-xor="${id}"]`);
    if (el) {
      el.classList.toggle('active', state.active.has(id));
      el.querySelector('input').checked = state.active.has(id);
    }
    document.getElementById('s-p').textContent = `Ativos: ${state.active.size}`;
    document.getElementById('s-active').textContent = `${state.active.size} loops`;
    this.render(app);
  },

  _updateAllInPlace(app) {
    document.querySelectorAll('.item[data-xor]').forEach((el) => {
      const id = +el.dataset.xor;
      el.classList.toggle('active', state.active.has(id));
      el.querySelector('input').checked = state.active.has(id);
    });
    document.getElementById('s-p').textContent = `Ativos: ${state.active.size}`;
    document.getElementById('s-active').textContent = `${state.active.size} loops`;
    this.render(app);
  },

  _togglePlay(app) {
    const btn = document.getElementById('btn-xor-play');
    if (state.playing) {
      this._stopAnim();
      if (btn) btn.textContent = '▶ Animar';
    } else {
      state.active.clear();
      state.playing = true;
      state.animCursor = -1;
      if (btn) btn.textContent = '⏸ Parar';
      this._updateAllInPlace(app);
      state.animId = setInterval(() => {
        state.animCursor++;
        if (state.animCursor >= app.DATA.loops.length) {
          this._stopAnim();
          const b = document.getElementById('btn-xor-play');
          if (b) b.textContent = '▶ Animar';
          return;
        }
        state.active.add(state.animCursor);
        const el = document.querySelector(`.item[data-xor="${state.animCursor}"]`);
        if (el) {
          el.classList.add('active');
          el.querySelector('input').checked = true;
          el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
        document.getElementById('s-p').textContent = `Ativos: ${state.active.size}`;
        document.getElementById('s-active').textContent = `${state.active.size} loops`;
        this.render(app);
      }, 120);
    }
  },

  render(app) {
    const { board, DATA, LOOP_EDGES } = app;
    const { ctx } = board;
    board.drawBoard();
    board.drawNodes(DATA.descricao.graus, { dim: true, labels: false });

    const edgeCounts = {};
    state.active.forEach((loopId) => {
      LOOP_EDGES[loopId].forEach((k) => {
        edgeCounts[k] = (edgeCounts[k] || 0) + 1;
      });
    });

    ctx.lineWidth = 4;
    for (const [key, count] of Object.entries(edgeCounts)) {
      if (count % 2 === 1) {
        const pts = key.split('|').map((s) => s.split(',').map(Number));
        const [ax, ay] = board.cellToPx(pts[0][0], pts[0][1]);
        const [bx, by] = board.cellToPx(pts[1][0], pts[1][1]);
        ctx.strokeStyle = '#5680e0';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }
  },

  renderPanel(app) {
    document.getElementById('s-p').textContent = `Ativos: ${state.active.size}`;
    document.getElementById('s-active').textContent = `${state.active.size} loops`;

    let list = '<div class="list" id="xor-list">';
    app.DATA.loops.forEach((l, i) => {
      const isActive = state.active.has(i);
      list += `<div class="item ${isActive ? 'active' : ''}" data-xor="${i}">` +
        `<input type="checkbox" ${isActive ? 'checked' : ''} style="pointer-events:none;"> ` +
        `Loop #${i + 1} <span style="color:#555570">(ciclo ${l.tamanho_ciclo})</span></div>`;
    });
    list += '</div>';

    const isPlaying = state.playing;

    document.getElementById('mode-panel').innerHTML = `
      <h2>Espaço de Ciclos GF(2)</h2>
      <div class="panel-intro">
        Clique em loops para ligar/desligar. As arestas
        <span style="color:#5680e0"><b>azuis</b></span> sobrevivem ao XOR.
      </div>
      <div style="display:flex; gap:5px; margin: 8px 0; flex-wrap:wrap;">
        <button id="btn-xor-clear">Limpar</button>
        <button id="btn-xor-all">Sel. Todos</button>
        <button id="btn-xor-play">${isPlaying ? '⏸ Parar' : '▶ Animar'}</button>
      </div>
      ${list}
    `;

    document.querySelectorAll('.item[data-xor]').forEach((el) => {
      el.onclick = () => {
        if (state.playing) { this._stopAnim(); document.getElementById('btn-xor-play').textContent = '▶ Animar'; }
        this._applyToggle(app, +el.dataset.xor);
      };
    });

    document.getElementById('btn-xor-clear').onclick = () => {
      this._stopAnim();
      state.active.clear();
      this._updateAllInPlace(app);
      const b = document.getElementById('btn-xor-play');
      if (b) b.textContent = '▶ Animar';
    };

    document.getElementById('btn-xor-all').onclick = () => {
      this._stopAnim();
      const b = document.getElementById('btn-xor-play');
      if (b) b.textContent = '▶ Animar';
      if (state.active.size === app.DATA.loops.length) {
        state.active.clear();
      } else {
        app.DATA.loops.forEach((_, i) => state.active.add(i));
      }
      this._updateAllInPlace(app);
    };

    document.getElementById('btn-xor-play').onclick = () => this._togglePlay(app);
  },
};
