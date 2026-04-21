// Árvore BFS de loops — canvas lateral com os 105 loops agrupados por tipo.
const LOOP_NODE_R = 6;

export function createLoopTree(canvas, DATA, SIM) {
  const ctx = canvas.getContext('2d');
  const TW = canvas.width;
  const TH = canvas.height;

  const nodePos = {}; // loopIdx → { x, y, type }

  function gridPositions(items, centerX, topY, availW, availH) {
    const n = items.length;
    if (n === 0) return {};
    const cols = Math.min(
      Math.max(2, Math.ceil(Math.sqrt((n * availW) / availH))),
      n
    );
    const rows = Math.ceil(n / cols);
    const stepX = availW / cols;
    const stepY = Math.min(22, availH / rows);
    const startX = centerX - ((cols - 1) * stepX) / 2;
    const out = {};
    items.forEach((idx, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      out[idx] = { x: startX + c * stepX, y: topY + r * stepY };
    });
    return out;
  }

  const det = SIM.loops_determinados;
  const livres = SIM.loops_livres;

  const rootX = TW / 2, rootY = 28;
  const hLeft = { x: TW * 0.28, y: 84, label: 'Determinados', n: det.length };
  const hRight = { x: TW * 0.72, y: 84, label: 'Livres', n: livres.length };

  const detPositions = gridPositions(
    det, hLeft.x, hLeft.y + 30, TW * 0.44 - 20, TH - hLeft.y - 80
  );
  const livresPositions = gridPositions(
    livres, hRight.x, hRight.y + 30, TW * 0.44 - 20, TH - hRight.y - 80
  );

  for (const idx of det) nodePos[idx] = { ...detPositions[idx], type: 'det' };
  for (const idx of livres) nodePos[idx] = { ...livresPositions[idx], type: 'livre' };

  function render(app) {
    const { state } = app;
    ctx.fillStyle = '#10101a';
    ctx.fillRect(0, 0, TW, TH);

    // título
    ctx.fillStyle = '#dcdce4';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Árvore BFS de loops (H¹ = ' + DATA.descricao.H1 + ')',
      TW / 2, 12);

    // linhas da raiz aos headers
    ctx.strokeStyle = '#2e2e40';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rootX, rootY); ctx.lineTo(hLeft.x, hLeft.y);
    ctx.moveTo(rootX, rootY); ctx.lineTo(hRight.x, hRight.y);
    ctx.stroke();

    // fios finos dos headers aos nós
    ctx.strokeStyle = 'rgba(255, 214, 107, 0.12)';
    for (const idx of det) {
      const p = nodePos[idx]; if (!p) continue;
      ctx.beginPath(); ctx.moveTo(hLeft.x, hLeft.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(102, 200, 255, 0.12)';
    for (const idx of livres) {
      const p = nodePos[idx]; if (!p) continue;
      ctx.beginPath(); ctx.moveTo(hRight.x, hRight.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    }

    // raiz
    ctx.fillStyle = '#8c8c9c';
    ctx.beginPath(); ctx.arc(rootX, rootY, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#dcdce4';
    ctx.font = 'bold 10px system-ui';
    ctx.fillText(String(DATA.loops.length), rootX, rootY);

    // headers
    for (const h of [hLeft, hRight]) {
      ctx.fillStyle = (h === hLeft) ? '#ffd66b' : '#66c8ff';
      ctx.beginPath(); ctx.arc(h.x, h.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0b0b12';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText(String(h.n), h.x, h.y);
      ctx.fillStyle = '#dcdce4';
      ctx.font = '10px system-ui';
      ctx.fillText(h.label, h.x, h.y - 18);
    }

    // loops determinados (dourado)
    for (const idx of det) {
      const p = nodePos[idx]; if (!p) continue;
      ctx.fillStyle = '#ffd66b';
      ctx.beginPath(); ctx.arc(p.x, p.y, LOOP_NODE_R, 0, Math.PI * 2); ctx.fill();
    }

    // loops livres (azul, com estados de "testado" e "satisfaz")
    for (const idx of livres) {
      const p = nodePos[idx]; if (!p) continue;
      const cursor = state.freeLoopCursor;
      const listIdx = livres.indexOf(idx);
      const wasTested = listIdx <= cursor;
      const isCurrent = (listIdx === cursor);
      const isValid = wasTested && app.loopSatisfiesConstraints(idx);

      ctx.fillStyle = isValid ? '#5ad06b'
                      : wasTested ? '#4a6a9a'
                      : '#66c8ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, LOOP_NODE_R, 0, Math.PI * 2);
      ctx.fill();

      if (isCurrent) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, LOOP_NODE_R + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // destaque (clique) — anel tracejado
    if (state.highlightedLoop !== null && nodePos[state.highlightedLoop]) {
      const p = nodePos[state.highlightedLoop];
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, LOOP_NODE_R + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // legenda
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.font = '10px system-ui';
    const legY = TH - 6;
    const items = [
      ['#ffd66b', 'determinado'],
      ['#66c8ff', 'livre'],
      ['#4a6a9a', 'testado'],
      ['#5ad06b', 'satisfaz'],
    ];
    let lx = 12;
    for (const [c, lbl] of items) {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(lx + 5, legY - 5, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8c8c9c';
      ctx.fillText(lbl, lx + 13, legY);
      lx += 13 + ctx.measureText(lbl).width + 14;
    }
  }

  function hitTest(mx, my) {
    let best = null, bestD = 1e9;
    for (const idx in nodePos) {
      const p = nodePos[idx];
      const d = (p.x - mx) ** 2 + (p.y - my) ** 2;
      if (d < bestD) { bestD = d; best = +idx; }
    }
    if (best !== null && bestD < (LOOP_NODE_R + 6) ** 2) return best;
    return null;
  }

  function onClick(app, handler) {
    canvas.addEventListener('click', (ev) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (ev.clientX - rect.left) * (TW / rect.width);
      const my = (ev.clientY - rect.top) * (TH / rect.height);
      const hit = hitTest(mx, my);
      if (hit !== null) handler(hit);
    });
  }

  return { render, onClick, nodePos, hitTest };
}
