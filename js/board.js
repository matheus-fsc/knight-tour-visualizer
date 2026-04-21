// Renderização do tabuleiro com primitivas reutilizáveis.
import { degreeColor } from './core.js';

export function createBoard(canvas, boardSize, margin = 32) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const CELL = (W - 2 * margin) / boardSize;

  function cellToPx(x, y) {
    return [margin + (x + 0.5) * CELL, margin + (boardSize - 0.5 - y) * CELL];
  }

  function pxToCell(px, py) {
    const cx = Math.floor((px - margin) / CELL);
    const cy = boardSize - 1 - Math.floor((py - margin) / CELL);
    if (cx < 0 || cx >= boardSize || cy < 0 || cy >= boardSize) return null;
    return [cx, cy];
  }

  function clear() {
    ctx.fillStyle = '#10101a';
    ctx.fillRect(0, 0, W, H);
  }

  function drawBoard() {
    clear();
    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        const [px, py] = cellToPx(x, y);
        ctx.fillStyle = ((x + y) % 2 === 0) ? '#1c1c28' : '#16161f';
        ctx.fillRect(px - CELL / 2, py - CELL / 2, CELL, CELL);
      }
    }
    ctx.fillStyle = '#4c4c5c';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (let x = 0; x < boardSize; x++) {
      ctx.fillText(
        String.fromCharCode(97 + x),
        margin + (x + 0.5) * CELL,
        H - margin / 2 + 4
      );
    }
    ctx.textAlign = 'right';
    for (let y = 0; y < boardSize; y++) {
      ctx.fillText(
        String(y + 1),
        margin - 6,
        margin + (boardSize - 0.5 - y) * CELL + 4
      );
    }
  }

  function drawNodes(graus, { dim = false, labels = true } = {}) {
    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        const [px, py] = cellToPx(x, y);
        const d = graus[x][y];
        ctx.beginPath();
        ctx.arc(px, py, 10, 0, Math.PI * 2);
        ctx.globalAlpha = dim ? 0.35 : 1;
        ctx.fillStyle = degreeColor(d);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (labels && !dim) {
          ctx.fillStyle = '#0b0b12';
          ctx.font = 'bold 10px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(d), px, py);
        }
      }
    }
  }

  function drawDiscreteNodes(color = '#2a2a38', r = 3) {
    for (let x = 0; x < boardSize; x++) {
      for (let y = 0; y < boardSize; y++) {
        const [px, py] = cellToPx(x, y);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }

  function drawEdge(a, b, { color = '#5680e0', width = 2, dash = null } = {}) {
    const [ax, ay] = cellToPx(a[0], a[1]);
    const [bx, by] = cellToPx(b[0], b[1]);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    if (dash) ctx.setLineDash([]);
  }

  function drawPath(path, { color = '#5ad06b', width = 2, radius = 6 } = {}) {
    if (!path.length) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
      const [px, py] = cellToPx(path[i][0], path[i][1]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    for (const [x, y] of path) {
      const [px, py] = cellToPx(x, y);
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  function legend(items, { x = 12, y = 10, lineHeight = 18 } = {}) {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 11px system-ui';
    items.forEach((item, i) => {
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, x, y + i * lineHeight);
    });
  }

  // Hover → tooltip com info da casa
  function attachHover(tooltipEl, formatter) {
    canvas.addEventListener('mousemove', (ev) => {
      const rect = canvas.getBoundingClientRect();
      const px = (ev.clientX - rect.left) * (W / rect.width);
      const py = (ev.clientY - rect.top) * (H / rect.height);
      const cell = pxToCell(px, py);
      if (!cell) {
        tooltipEl.style.display = 'none';
        return;
      }
      const text = formatter(cell);
      if (!text) {
        tooltipEl.style.display = 'none';
        return;
      }
      tooltipEl.textContent = text;
      tooltipEl.style.display = 'block';
      tooltipEl.style.left = (ev.clientX + 12) + 'px';
      tooltipEl.style.top = (ev.clientY + 12) + 'px';
    });
    canvas.addEventListener('mouseleave', () => {
      tooltipEl.style.display = 'none';
    });
  }

  return {
    ctx, W, H, CELL, margin, boardSize,
    cellToPx, pxToCell,
    clear, drawBoard, drawNodes, drawDiscreteNodes,
    drawEdge, drawPath, legend, attachHover,
  };
}
