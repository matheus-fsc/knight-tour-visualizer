// Modo "Hierarquia" — mesma árvore BFS, mas em visualização abstrata (níveis verticais).
import { levelColor } from '../core.js';

function layoutTree(DATA) {
  const children = {};
  for (const n of DATA.arvore.nos) {
    const key = n.casa.join(',');
    children[key] = children[key] || [];
    if (n.pai) {
      const pk = n.pai.join(',');
      children[pk] = children[pk] || [];
      children[pk].push(key);
    }
  }
  const rootKey = DATA.arvore.raiz.join(',');
  const w = {}, x = {}, y = {};
  function measure(k) {
    const kids = children[k] || [];
    if (!kids.length) { w[k] = 1; return 1; }
    let s = 0; for (const c of kids) s += measure(c);
    w[k] = s; return s;
  }
  function assign(k, left, lvl) {
    x[k] = left + w[k] / 2; y[k] = lvl;
    let off = left;
    for (const c of (children[k] || [])) {
      assign(c, off, lvl + 1); off += w[c];
    }
  }
  measure(rootKey); assign(rootKey, 0, 0);
  return { x, y, totalW: w[rootKey] };
}

let cachedLayout = null;
function getLayout(DATA) {
  if (!cachedLayout) cachedLayout = layoutTree(DATA);
  return cachedLayout;
}

export default {
  key: 'hierarquia',
  label: 'Hierarquia',
  note: `
    <b>Mesma árvore do modo anterior, vista de cima.</b>
    Os círculos são as 64 casas dispostas por <b>nível</b> (distância da raiz).
    As linhas verdes são as 63 arestas da árvore geradora.
    As curvas laranjas são as 105 arestas "extras" — cada uma fecha um loop
    fundamental ao conectar dois galhos diferentes da árvore.
  `,

  render(app) {
    const { board, DATA } = app;
    const { ctx, W, H } = board;
    ctx.fillStyle = '#10101a';
    ctx.fillRect(0, 0, W, H);

    const { x, y, totalW } = getLayout(DATA);
    const numLevels = DATA.arvore.num_niveis;
    const padX = 24, padYtop = 24, padYbot = 36;
    const drawW = W - 2 * padX;
    const drawH = H - padYtop - padYbot;
    const px = (k) => padX + (x[k] / totalW) * drawW;
    const py = (k) => padYtop + (y[k] / Math.max(1, numLevels - 1)) * drawH;

    // Arestas fora da árvore — curvas suaves (105 loops)
    ctx.strokeStyle = 'rgba(255, 160, 80, 0.10)';
    ctx.lineWidth = 1;
    for (const [a, b] of DATA.arvore.arestas_fora) {
      const ka = a.join(','), kb = b.join(',');
      const ax = px(ka), ay = py(ka);
      const bx = px(kb), by = py(kb);
      const mx = (ax + bx) / 2;
      const my = Math.max(ay, by) + 24 + Math.abs(ax - bx) * 0.04;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(mx, my, bx, by);
      ctx.stroke();
    }

    // Arestas da árvore (63)
    ctx.strokeStyle = '#5ad06b';
    ctx.lineWidth = 1.6;
    for (const n of DATA.arvore.nos) {
      if (!n.pai) continue;
      const k = n.casa.join(',');
      const pk = n.pai.join(',');
      ctx.beginPath();
      ctx.moveTo(px(pk), py(pk));
      ctx.lineTo(px(k), py(k));
      ctx.stroke();
    }

    // Nós coloridos por nível
    for (const n of DATA.arvore.nos) {
      const k = n.casa.join(',');
      const nx = px(k), ny = py(k);
      ctx.beginPath();
      ctx.arc(nx, ny, 7, 0, Math.PI * 2);
      ctx.fillStyle = levelColor(n.nivel, numLevels);
      ctx.fill();
    }

    // Legenda
    board.legend([
      { color: '#5ad06b', text: '— árvore (63)' },
      { color: 'rgba(255,180,110,.85)', text: '⌢ fora da árvore (105)' },
    ], { y: H - 40, lineHeight: 16 });
  },

  renderPanel(app) {
    const { DATA } = app;
    document.getElementById('s-p').textContent = '—/—';
    document.getElementById('s-active').textContent = '—';
    const niveis = DATA.arvore.num_niveis;
    const contagem = new Array(niveis).fill(0);
    for (const n of DATA.arvore.nos) contagem[n.nivel]++;
    let dist = '<div class="list">';
    for (let l = 0; l < niveis; l++) {
      dist += `<div class="item">nível ${l}:
        <b style="color:#ffd66b">${contagem[l]}</b> casas</div>`;
    }
    dist += '</div>';
    document.getElementById('mode-panel').innerHTML = `
      <h2>Árvore geradora</h2>
      <div class="stat">
        <span class="stat-label">Raiz</span>
        <span class="stat-value">(${DATA.arvore.raiz.join(',')})</span>
      </div>
      <div class="stat">
        <span class="stat-label">Arestas da árvore</span>
        <span class="stat-value green">${DATA.arvore.arestas_arvore.length}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Arestas fora (loops)</span>
        <span class="stat-value gold">${DATA.arvore.arestas_fora.length}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Profundidade</span>
        <span class="stat-value">${niveis - 1}</span>
      </div>
      <h2>Casas por nível</h2>
      ${dist}
    `;
  },
};
