// Orquestração: carrega dados, monta board + loop-tree, gerencia modos.
import { loadData, edgeKey, getLoopEdges } from './core.js';
import { createBoard } from './board.js';
import { createLoopTree } from './loop-tree.js';

import grafo      from './modes/grafo.js';
import loops      from './modes/loops.js';
import solucao    from './modes/solucao.js';
import arvore     from './modes/arvore.js';
import hierarquia from './modes/hierarquia.js';
import xor        from './modes/xor.js';
import simetria   from './modes/simetria.js';

const MODES = [grafo, loops, solucao, arvore, hierarquia, xor, simetria];

(async () => {
  const DATA = await loadData();
  console.log('[app] loadData retornou:', DATA);
  if (!DATA || !DATA.arestas) {
    document.body.innerHTML =
      `<div id="error">
        Não consegui carregar <code>cavalo_data.json</code> corretamente.<br><br>
        ${!DATA ? 'Fetch falhou (verifique o servidor HTTP).' : 'JSON carregado mas campo <code>arestas</code> ausente — JSON pode estar corrompido ou desatualizado.'}
        <br><br>Rode <code>python3 cavalo_engine.py</code> e sirva por HTTP
        (<code>python3 -m http.server</code>).
        Verifique o console para mais detalhes.
      </div>`;
    return;
  }

  const boardSize = Math.sqrt(DATA.descricao.V);
  const SIM = DATA.simetria || {
    arestas_obrigatorias: [],
    arestas_impossiveis: [],
    orbitas: [],
    loops_livres: [],
    loops_determinados: [],
  };

  // preenche painel lateral fixo
  document.getElementById('s-v').textContent = DATA.descricao.V;
  document.getElementById('s-e').textContent = DATA.descricao.E;
  document.getElementById('s-h').textContent = DATA.descricao.H1;
  document.getElementById('s-mand').textContent =
    `${SIM.arestas_obrigatorias.length} (${SIM.orbitas.length} órb.)`;
  document.getElementById('s-forb').textContent = SIM.arestas_impossiveis.length;
  document.getElementById('s-livres').textContent = SIM.loops_livres.length;
  document.getElementById('s-det').textContent = SIM.loops_determinados.length;
  document.getElementById('c-total').textContent = SIM.loops_livres.length;

  // índices de arestas
  const mandSet = new Set(SIM.arestas_obrigatorias.map(([a, b]) => edgeKey(a, b)));
  const forbSet = new Set(SIM.arestas_impossiveis.map(([a, b]) => edgeKey(a, b)));
  const edgeToOrbit = {};
  SIM.orbitas.forEach((orb, i) => {
    for (const [a, b] of orb) edgeToOrbit[edgeKey(a, b)] = i;
  });
  const LOOP_EDGES = DATA.loops.map(getLoopEdges);

  // board e loop-tree
  const canvas = document.getElementById('canvas');
  const board = createBoard(canvas, boardSize, 32);
  const treeCanvas = document.getElementById('tree-canvas');
  const loopTree = createLoopTree(treeCanvas, DATA, SIM);

  // hover tooltip: mostra coord/grau/paridade da casa sob o mouse
  const tooltipEl = document.getElementById('hover-tooltip');
  board.attachHover(tooltipEl, ([x, y]) => {
    const d = DATA.descricao.graus[x][y];
    const p = (x + y) % 2 === 0 ? 'preta' : 'branca';
    return `(${x},${y}) · grau ${d} · ${p}`;
  });

  // estado compartilhado
  const state = {
    highlightedLoop: null,
    freeLoopCursor: -1,
    freeLoopsSatisfied: 0,
  };

  // A free loop "satisfaz" if combining it with mandatory edges never pushes
  // any node above degree 2 (i.e. it doesn't conflict with forced edges).
  function loopSatisfiesConstraints(loopIdx) {
    const degrees = {};
    for (const k of mandSet) {
      const [a, b] = k.split('|');
      degrees[a] = (degrees[a] || 0) + 1;
      degrees[b] = (degrees[b] || 0) + 1;
    }
    for (const k of LOOP_EDGES[loopIdx]) {
      const [a, b] = k.split('|');
      degrees[a] = (degrees[a] || 0) + 1;
      degrees[b] = (degrees[b] || 0) + 1;
    }
    for (const v of Object.values(degrees)) {
      if (v > 2) return false;
    }
    return true;
  }

  const app = {
    DATA, SIM, boardSize,
    mandSet, forbSet, edgeToOrbit, LOOP_EDGES,
    board, loopTree,
    state,
    currentMode: null,
    speed: () => +document.getElementById('speed').value,
    keyOf: edgeKey,
    loopSatisfiesConstraints,
  };

  function updateCounter() {
    document.getElementById('c-tested').textContent =
      Math.max(0, state.freeLoopCursor + 1);
    document.getElementById('c-sat').textContent = state.freeLoopsSatisfied;
  }

  function setMode(newMode) {
    // cleanup do modo anterior
    if (app.currentMode && app.currentMode.onExit) {
      app.currentMode.onExit(app);
    }
    app.currentMode = newMode;

    // botão ativo
    document.querySelectorAll('#controls button[data-mode]').forEach((b) =>
      b.classList.toggle('active', b.dataset.mode === newMode.key));

    // nota explicativa do modo (abaixo do tabuleiro)
    document.getElementById('board-note').innerHTML = newMode.note;

    // col 3 (árvore de loops) só aparece no modo Simetria
    document.getElementById('tree-col').classList
      .toggle('visible', newMode.key === 'simetria');

    // inicialização do modo
    if (newMode.onEnter) {
      newMode.onEnter(app);
    } else {
      newMode.render(app);
      newMode.renderPanel(app);
    }

    // árvore de loops é sempre re-renderizada
    loopTree.render(app);
  }

  // controles
  const controlsEl = document.getElementById('controls');
  MODES.forEach((m) => {
    const btn = document.createElement('button');
    btn.dataset.mode = m.key;
    btn.textContent = m.label;
    btn.onclick = () => setMode(m);
    controlsEl.insertBefore(btn, document.getElementById('speed-wrap'));
  });

  // step-by-step dos loops livres
  function stepNextFreeLoop() {
    if (state.freeLoopCursor + 1 >= SIM.loops_livres.length) return;
    state.freeLoopCursor++;
    const idx = SIM.loops_livres[state.freeLoopCursor];
    if (loopSatisfiesConstraints(idx)) state.freeLoopsSatisfied++;
    state.highlightedLoop = idx;
    updateCounter();
    loopTree.render(app);
    if (app.currentMode.key === 'simetria') {
      app.currentMode.render(app);
      app.currentMode.renderPanel(app);
    }
  }

  function resetFreeLoops() {
    state.freeLoopCursor = -1;
    state.freeLoopsSatisfied = 0;
    state.highlightedLoop = null;
    updateCounter();
    loopTree.render(app);
    if (app.currentMode.key === 'simetria') {
      app.currentMode.render(app);
      app.currentMode.renderPanel(app);
    }
  }

  let autoId = null;
  function toggleAuto() {
    const btn = document.getElementById('btn-tree-auto');
    if (autoId) {
      clearInterval(autoId); autoId = null;
      btn.textContent = 'Auto ▶▶';
    } else {
      btn.textContent = 'Parar ■';
      autoId = setInterval(() => {
        if (state.freeLoopCursor + 1 >= SIM.loops_livres.length) {
          clearInterval(autoId); autoId = null;
          btn.textContent = 'Auto ▶▶';
        } else stepNextFreeLoop();
      }, 180);
    }
  }

  document.getElementById('btn-tree-next').onclick = stepNextFreeLoop;
  document.getElementById('btn-tree-reset').onclick = resetFreeLoops;
  document.getElementById('btn-tree-auto').onclick = toggleAuto;

  // clique na árvore de loops → destaca no tabuleiro
  loopTree.onClick(app, (loopIdx) => {
    state.highlightedLoop = loopIdx;
    const hasMand = Array.from(LOOP_EDGES[loopIdx]).some((k) => mandSet.has(k));
    document.getElementById('tree-note').innerHTML = `
      <b>Loop #${loopIdx + 1}</b> &middot;
      ciclo de ${DATA.loops[loopIdx].tamanho_ciclo} passos &middot;
      ${hasMand ? 'contém aresta obrigatória'
                : 'sem aresta obrigatória (livre)'}.
      As arestas deste loop estão destacadas no tabuleiro (modo
      <b>Simetria</b> mostra o contraste com cores de órbita).
    `;
    loopTree.render(app);
    if (app.currentMode.key === 'simetria') {
      app.currentMode.render(app);
      app.currentMode.renderPanel(app);
    }
  });

  // arranque
  setMode(grafo);
  updateCounter();
})();
