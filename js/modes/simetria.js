// Modo "Simetria" — arestas obrigatórias (por órbita), impossíveis e livres.
import { orbitColor } from '../core.js';

export default {
  key: 'simetria',
  label: 'Simetria',
  note: `
    <b>Quais arestas têm destino certo?</b> Algumas arestas aparecem em
    <b>100% dos passeios possíveis</b> — são as <span style="color:#ffd66b">
    <b>obrigatórias</b></span> (nos cantos, porque o cavalo só tem 2 saídas
    de lá, então ambas têm que ser usadas).
    <br><br>
    As <span style="color:#c84646"><b>impossíveis</b></span> (tracejado
    vermelho) nunca aparecem em um passeio. As <span style="color:#6e6e80">
    <b>livres</b></span> (cinza) podem ou não ser usadas.
    Cores distintas agrupam arestas <b>equivalentes por simetria</b>
    (rotações 90°/180°/270° e reflexões H/V/diagonal do tabuleiro).
  `,

  onEnter(app) {
    this.render(app);
    this.renderPanel(app);
  },

  render(app) {
    const { board, DATA, SIM, mandSet, forbSet, edgeToOrbit, LOOP_EDGES, state } = app;
    const { ctx } = board;
    board.drawBoard();

    // 1. Arestas livres em cinza
    for (const [a, b] of DATA.arestas) {
      const k = app.keyOf(a, b);
      if (mandSet.has(k) || forbSet.has(k)) continue;
      board.drawEdge(a, b, { color: 'rgba(120, 120, 140, 0.15)', width: 1 });
    }

    // 2. Arestas impossíveis em vermelho apagado
    for (const [a, b] of SIM.arestas_impossiveis) {
      board.drawEdge(a, b, {
        color: 'rgba(200, 70, 70, 0.45)', width: 1.5, dash: [4, 3],
      });
    }

    // 3. Loop destacado (se houver) em azul claro
    if (state.highlightedLoop !== null) {
      for (const k of LOOP_EDGES[state.highlightedLoop]) {
        const pts = k.split('|').map((s) => s.split(',').map(Number));
        board.drawEdge(pts[0], pts[1], {
          color: 'rgba(180, 210, 255, 0.75)', width: 2,
        });
      }
    }

    // 4. Arestas obrigatórias coloridas por órbita
    for (const [a, b] of SIM.arestas_obrigatorias) {
      const k = app.keyOf(a, b);
      const orb = edgeToOrbit[k] ?? 0;
      board.drawEdge(a, b, { color: orbitColor(orb), width: 4 });
    }

    // 5. Nós discretos
    board.drawDiscreteNodes('#2e2e40', 4);
  },

  renderPanel(app) {
    const { SIM, state } = app;
    document.getElementById('s-p').textContent =
      `${state.freeLoopCursor + 1}/${SIM.loops_livres.length}`;
    document.getElementById('s-active').textContent =
      state.highlightedLoop !== null ? `#${state.highlightedLoop + 1}` : '—';

    let orbitHtml = '';
    SIM.orbitas.forEach((orb, i) => {
      orbitHtml += `
        <div class="item" style="border-left: 3px solid ${orbitColor(i)};">
          <span class="orbit-chip" style="background:${orbitColor(i)}"></span>
          Órbita ${i + 1} — ${orb.length} aresta${orb.length === 1 ? '' : 's'}
        </div>`;
    });
    orbitHtml = orbitHtml
      ? `<div class="list">${orbitHtml}</div>`
      : '<div class="note">Nenhuma órbita detectada.</div>';

    const currentFree = state.freeLoopCursor >= 0
      ? SIM.loops_livres[state.freeLoopCursor] : null;
    const currentFreeHtml = currentFree !== null
      ? `<div class="stat">
           <span class="stat-label">Loop livre #${currentFree + 1}</span>
           <span class="stat-value">${
             app.loopSatisfiesConstraints(currentFree) ? '✓ satisfaz' : '✗ não satisfaz'
           }</span>
         </div>`
      : '<div class="panel-intro">Clique em <b>Próximo loop</b> para testar os livres um por um.</div>';

    document.getElementById('mode-panel').innerHTML = `
      <h2>Legenda do tabuleiro</h2>
      <div class="panel-intro">
        <span style="color:#ffd66b">━</span> obrigatória &nbsp;·&nbsp;
        <span style="color:#c84646">╍</span> impossível &nbsp;·&nbsp;
        <span style="color:#6e6e80">━</span> livre
      </div>
      <h2>Órbitas (grupo D₄)</h2>
      ${orbitHtml}
      <h2>Teste passo a passo</h2>
      <div class="panel-intro">
        Um loop livre <b>satisfaz</b> se combinar suas arestas com as
        obrigatórias <b>não ultrapassa grau 2 em nenhuma casa</b>.
        <br><br>
        As arestas obrigatórias saem dos 4 cantos (grau 2 no grafo do cavalo).
        Isso deixa 8 casas vizinhas de canto — como <code>(1,2)</code> e
        <code>(2,1)</code> — já com grau 1. Qualquer loop que <em>passe por
        uma dessas 8 casas</em> causaria grau 3 ali: <b>inválido</b>.
        <br><br>
        Os loops que satisfazem são os que <b>evitam completamente essas
        8 casas</b>, permanecendo compatíveis com a solução parcial forçada.
        No tabuleiro aparecem em
        <span style="color:#5ad06b;font-weight:600">verde</span> na árvore.
      </div>
      ${currentFreeHtml}
    `;
  },
};
