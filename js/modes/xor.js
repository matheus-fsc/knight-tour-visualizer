// Modo "Fusão GF(2)" — seleção interativa de loops; arestas sobrevivem por XOR (paridade).

const state = {
  active: new Set(),
  animId: null,
  animCursor: -1,
  playing: false,
  showStats: false,
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

  // Computa estatísticas do grafo resultante do XOR atual
  _computeStats(edgeCounts) {
    const activeEdges = Object.entries(edgeCounts).filter(([, c]) => c % 2 === 1);
    const deg = {};
    for (const [key] of activeEdges) {
      const pts = key.split('|');
      deg[pts[0]] = (deg[pts[0]] || 0) + 1;
      deg[pts[1]] = (deg[pts[1]] || 0) + 1;
    }
    const degVals = Object.values(deg);
    const maxDeg = degVals.length ? Math.max(...degVals) : 0;
    const isolated = 64 - Object.keys(deg).length;

    // Conta componentes conectadas
    const adj = {};
    for (const [key] of activeEdges) {
      const [a, b] = key.split('|');
      (adj[a] = adj[a] || []).push(b);
      (adj[b] = adj[b] || []).push(a);
    }
    const visited = new Set();
    let components = 0;
    for (const n of Object.keys(adj)) {
      if (!visited.has(n)) {
        components++;
        const q = [n];
        visited.add(n);
        while (q.length) {
          const cur = q.pop();
          for (const nb of (adj[cur] || [])) {
            if (!visited.has(nb)) { visited.add(nb); q.push(nb); }
          }
        }
      }
    }

    return {
      edges: activeEdges.length,
      maxDeg,
      isolated,
      components: activeEdges.length === 0 ? 0 : components,
    };
  },

  // Atualiza item da lista em-lugar (scroll preservado)
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

  _renderStats(edgeCounts) {
    const el = document.getElementById('xor-stats');
    if (!el) return;
    if (!state.showStats) { el.style.display = 'none'; return; }

    const s = this._computeStats(edgeCounts);
    const V = 64;

    // Metas: edges=64, maxDeg=2, isolated=0, components=1
    const ok  = (v, t) => v === t;
    const col = (v, t) => ok(v, t) ? '#5ad06b' : (v < t ? '#e0b840' : '#cc5050');

    const row = (label, val, target, unit = '') => `
      <div class="stat" style="padding:4px 0">
        <span class="stat-label">${label}</span>
        <span style="font-variant-numeric:tabular-nums;font-size:12px;font-weight:600;
                     color:${col(val, target)}">
          ${val}${unit}
          <span style="color:#444458;font-weight:400;font-size:10px"> / ${target}</span>
        </span>
      </div>`;

    el.style.display = 'block';
    el.innerHTML =
      row('Arestas ativas', s.edges, V) +
      row('Grau máximo', s.maxDeg, 2) +
      row('Nós isolados', s.isolated, 0) +
      row('Componentes', s.components, 1) +
      (s.edges === V && s.maxDeg === 2 && s.isolated === 0 && s.components === 1
        ? `<div style="margin-top:6px;padding:6px 8px;background:#1a2e1a;border:1px solid #2e5a2e;
                       border-radius:4px;color:#5ad06b;font-size:11px;font-weight:600;text-align:center">
             ✓ Passeio completo do cavalo!
           </div>`
        : '');
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

    this._renderStats(edgeCounts);
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

    document.getElementById('mode-panel').innerHTML = `
      <h2>Espaço de Ciclos GF(2)</h2>
      <div class="panel-intro">
        Clique em loops para ligar/desligar. As arestas
        <span style="color:#5680e0"><b>azuis</b></span> sobrevivem ao XOR.
      </div>
      <div style="display:flex; gap:5px; margin: 8px 0; flex-wrap:wrap;">
        <button id="btn-xor-clear">Limpar</button>
        <button id="btn-xor-all">Sel. Todos</button>
        <button id="btn-xor-play">${state.playing ? '⏸ Parar' : '▶ Animar'}</button>
        <button id="btn-xor-stats" style="${state.showStats ? 'background:#1c2c1c;border-color:#3a6a3a;color:#5ad06b' : ''}">
          ${state.showStats ? '📊 Ocultar stats' : '📊 Ver stats'}
        </button>
      </div>
      <div id="xor-stats" style="display:none; background:#111119; border:1px solid #1e1e2c;
           border-radius:4px; padding:8px 10px; margin-bottom:6px;"></div>
      ${list}
    `;

    document.querySelectorAll('.item[data-xor]').forEach((el) => {
      el.onclick = () => {
        if (state.playing) {
          this._stopAnim();
          const b = document.getElementById('btn-xor-play');
          if (b) b.textContent = '▶ Animar';
        }
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

    document.getElementById('btn-xor-stats').onclick = () => {
      state.showStats = !state.showStats;
      const btn = document.getElementById('btn-xor-stats');
      if (btn) {
        btn.textContent = state.showStats ? '📊 Ocultar stats' : '📊 Ver stats';
        btn.style.background = state.showStats ? '#1c2c1c' : '';
        btn.style.borderColor = state.showStats ? '#3a6a3a' : '';
        btn.style.color = state.showStats ? '#5ad06b' : '';
      }
      this.render(app);
    };

    // Renderiza stats se já estiver ativo
    this.render(app);
  },
};
