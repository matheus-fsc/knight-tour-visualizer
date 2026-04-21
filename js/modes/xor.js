// Modo "Fusão GF(2)" — seleção interativa de loops; arestas sobrevivem por XOR (paridade).

const state = {
  active: new Set(),
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
    let list = '<div class="list">';
    app.DATA.loops.forEach((l, i) => {
      const isActive = state.active.has(i);
      list += `<div class="item ${isActive ? 'active' : ''}" data-xor="${i}">` +
        `<input type="checkbox" ${isActive ? 'checked' : ''} style="pointer-events:none;"> ` +
        `Loop #${i + 1} (ciclo ${l.tamanho_ciclo})</div>`;
    });
    list += '</div>';

    document.getElementById('mode-panel').innerHTML = `
      <h2>Espaço de Ciclos GF(2)</h2>
      <div class="panel-intro">
        Clique em loops abaixo para ligar/desligar.
        As arestas azuis no tabuleiro são as que <b>sobrevivem</b> ao XOR.
      </div>
      <button id="btn-clear-xor" style="width:100%; margin:8px 0;">Limpar seleção</button>
      ${list}
    `;

    document.querySelectorAll('.item[data-xor]').forEach((el) => {
      el.onclick = () => {
        const id = +el.dataset.xor;
        if (state.active.has(id)) state.active.delete(id);
        else state.active.add(id);
        this.render(app);
        this.renderPanel(app);
      };
    });
    document.getElementById('btn-clear-xor').onclick = () => {
      state.active.clear();
      this.render(app);
      this.renderPanel(app);
    };
  },
};
