// Modo "Árvore" — descobre casas por BFS passo a passo.
import { levelColor } from '../core.js';

const state = {
  step: 0,
  anim: 0,
  rafId: null,
};

export default {
  key: 'arvore',
  label: 'Árvore',
  note: `
    <b>BFS — busca em largura.</b> Começando na casa raiz, descobrimos
    primeiro os vizinhos diretos (nível 1), depois os vizinhos dos vizinhos
    (nível 2), e assim por diante.
    <br><br>
    Isso gera uma <b>árvore geradora</b>: 63 arestas que conectam todas as
    64 casas sem formar nenhum ciclo.
    As outras <b>105 arestas</b> do grafo ficam de fora — cada uma delas
    "fecha" um loop fundamental. A cor de cada casa indica sua distância
    da raiz (azul = perto, amarelo = longe).
  `,

  onEnter(app) {
    state.step = 0;
    state.anim = 0;
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
    const { ctx } = board;
    board.drawBoard();
    board.drawDiscreteNodes('#26263a');

    const nos = DATA.arvore.nos;
    const numLevels = DATA.arvore.num_niveis;
    const revealed = nos.slice(0, state.step + 1);

    ctx.lineWidth = 2;
    for (const n of revealed) {
      if (!n.pai) continue;
      const [ax, ay] = board.cellToPx(n.pai[0], n.pai[1]);
      const [bx, by] = board.cellToPx(n.casa[0], n.casa[1]);
      ctx.strokeStyle = levelColor(n.nivel, numLevels);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    for (let i = 0; i < revealed.length; i++) {
      const n = revealed[i];
      const [px, py] = board.cellToPx(n.casa[0], n.casa[1]);
      const isHead = (i === revealed.length - 1);
      ctx.beginPath();
      ctx.arc(px, py, isHead ? 12 : 9, 0, Math.PI * 2);
      ctx.fillStyle = levelColor(n.nivel, numLevels);
      ctx.fill();
      if (isHead) {
        ctx.strokeStyle = '#ffd66b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 15, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#0b0b12';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(n.nivel), px, py);
    }
  },

  tick(app) {
    state.anim += app.speed() / 1500;
    if (state.anim >= 1) {
      state.anim = 0;
      if (state.step < app.DATA.arvore.nos.length - 1) {
        state.step++;
        this.renderPanel(app);
      }
    }
    this.render(app);
    if (app.currentMode === this) {
      state.rafId = requestAnimationFrame(() => this.tick(app));
    }
  },

  renderPanel(app) {
    const { DATA } = app;
    const total = DATA.arvore.nos.length;
    document.getElementById('s-p').textContent = `${state.step + 1}/${total}`;
    document.getElementById('s-active').textContent = '—';
    const n = DATA.arvore.nos[state.step];
    const paiStr = n.pai ? `(${n.pai[0]},${n.pai[1]})` : '— (raiz)';
    document.getElementById('mode-panel').innerHTML = `
      <h2>BFS a partir de (${DATA.arvore.raiz.join(',')})</h2>
      <div class="stat">
        <span class="stat-label">Casa</span>
        <span class="stat-value">(${n.casa[0]},${n.casa[1]})</span>
      </div>
      <div class="stat">
        <span class="stat-label">Distância da raiz</span>
        <span class="stat-value">${n.nivel}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Descoberta por</span>
        <span class="stat-value">${paiStr}</span>
      </div>
      <div class="panel-intro">
        A fórmula <b>H¹ = E − V + 1 = ${DATA.descricao.E} − ${DATA.descricao.V} + 1
        = ${DATA.descricao.H1}</b> conta quantos "buracos" o grafo tem.
        Aqui, cada buraco é um loop independente.
      </div>
    `;
  },
};
