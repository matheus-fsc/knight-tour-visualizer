// Modo "Grafo" — desenha todas as 168 arestas do tabuleiro.

export default {
  key: 'grafo',
  label: 'Grafo',
  note: `
    <b>O que é isto?</b> O cavalo do xadrez se move em forma de L.
    No tabuleiro 8×8, cada casa tem alguns vizinhos possíveis — ao todo
    são <b>168 ligações</b> (arestas).
    As linhas azuis mostram para onde o cavalo pode pular.
    O número dentro de cada círculo conta quantos vizinhos aquela casa tem:
    <b>2 nos cantos</b> (o cavalo só tem duas opções de saída) e
    <b>8 no centro</b> (o lugar mais conectado).
  `,

  render(app) {
    const { board, DATA } = app;
    board.drawBoard();
    for (const [a, b] of DATA.arestas) {
      board.drawEdge(a, b, { color: 'rgba(120, 140, 200, 0.22)', width: 1 });
    }
    board.drawNodes(DATA.descricao.graus);
  },

  renderPanel(app) {
    const { DATA } = app;
    document.getElementById('s-p').textContent = '—/—';
    document.getElementById('s-active').textContent = '—';
    document.getElementById('mode-panel').innerHTML = `
      <h2>Graus por casa</h2>
      <div class="legend">
        <span>2</span><div class="grad"></div><span>8</span>
      </div>
      <div class="panel-intro">
        A soma de todos os graus é
        <b>2·E = ${2 * DATA.descricao.E}</b>, porque cada aresta conta
        duas vezes (uma em cada ponta).
      </div>
      <h2>Paridade do tabuleiro</h2>
      <div class="panel-intro">
        Cada pulo do cavalo troca a cor da casa (preta ↔ branca).
        Isso torna o grafo <b>bipartido</b>: qualquer ciclo tem
        comprimento par.
      </div>
    `;
  },
};
