// Modo "Solução" — anima o algoritmo de Warnsdorff passo a passo.

const state = {
  step: 0,
  phase: 0,
  rafId: null,
};

export default {
  key: 'solucao',
  label: 'Solução',
  note: `
    <b>Como o cavalo visita todas as 64 casas?</b>
    A heurística de <b>Warnsdorff</b> tem uma regra simples: a cada passo,
    escolha a casa com <b>menos saídas ainda disponíveis</b>. Isso evita
    "becos sem saída" — casas que ficariam isoladas sem visita.
    <br><br>
    Em verde, o caminho já percorrido. Em amarelo, a próxima casa escolhida.
    Em roxo tracejado, as alternativas que foram <b>rejeitadas</b> por terem
    mais saídas (os números dentro delas indicam quantas saídas futuras teriam).
  `,

  onEnter(app) {
    state.step = 0;
    state.phase = 0;
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
    board.drawDiscreteNodes('#2a2a38');

    const passos = DATA.solucao.passos;
    const caminho = DATA.solucao.caminho;
    const path = caminho.slice(0, state.step + 1);

    ctx.strokeStyle = '#5ad06b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const [px, py] = board.cellToPx(path[i][0], path[i][1]);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    for (let i = 0; i < path.length; i++) {
      const [px, py] = board.cellToPx(path[i][0], path[i][1]);
      const isHead = (i === path.length - 1);
      ctx.beginPath();
      ctx.arc(px, py, isHead ? 13 : 10, 0, Math.PI * 2);
      ctx.fillStyle = isHead ? '#ffd66b' : '#5ad06b';
      ctx.fill();
      ctx.fillStyle = '#0b0b12';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i), px, py);
    }

    const next = passos[state.step + 1];
    if (next && state.phase < 1) {
      const fade = Math.sin(state.phase * Math.PI);
      ctx.globalAlpha = fade;
      for (const alt of next.alternativas) {
        const [px, py] = board.cellToPx(alt.casa[0], alt.casa[1]);
        ctx.strokeStyle = '#8c5cff';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#b89cff';
        ctx.font = 'bold 10px system-ui';
        ctx.fillText(String(alt.grau_futuro), px, py);
      }
      const [px, py] = board.cellToPx(next.casa[0], next.casa[1]);
      ctx.strokeStyle = '#ffd66b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    board.legend([
      { color: '#b89cff', text: '○ alternativa (número = saídas futuras)' },
      { color: '#ffd66b', text: '★ escolhida (menor nº de saídas)' },
      { color: '#5ad06b', text: '● caminho percorrido' },
    ]);
  },

  tick(app) {
    state.phase += app.speed() / 1200;
    if (state.phase >= 2) {
      state.phase = 0;
      if (state.step < app.DATA.solucao.passos.length - 1) {
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
    const total = DATA.solucao.passos.length;
    document.getElementById('s-p').textContent = `${state.step + 1}/${total}`;
    document.getElementById('s-active').textContent = '—';
    const st = DATA.solucao.passos[state.step];
    document.getElementById('mode-panel').innerHTML = `
      <h2>Warnsdorff</h2>
      <div class="stat">
        <span class="stat-label">Casa atual</span>
        <span class="stat-value">(${st.casa[0]},${st.casa[1]})</span>
      </div>
      <div class="stat">
        <span class="stat-label">Saídas futuras</span>
        <span class="stat-value">${st.grau_futuro ?? '—'}</span>
      </div>
      <div class="panel-intro">
        Por que funciona? Escolher a casa mais "apertada" (menos saídas)
        primeiro <b>libera</b> as outras. Se deixássemos os cantos para o
        fim, eles ficariam inalcançáveis.
      </div>
    `;
  },
};
