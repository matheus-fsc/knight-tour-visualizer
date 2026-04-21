// Utilidades compartilhadas por todos os módulos.

export async function loadData(path = './cavalo_data.json') {
  try {
    const url = path + '?v=' + Date.now();
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    console.error('[loadData] erro ao carregar dados:', e);
    return null;
  }
}

// Chave canônica de uma aresta (ordenada para ignorar direção).
export function edgeKey(a, b) {
  const ax = a[0], ay = a[1], bx = b[0], by = b[1];
  if (ax < bx || (ax === bx && ay < by)) return `${ax},${ay}|${bx},${by}`;
  return `${bx},${by}|${ax},${ay}`;
}

// Extrai arestas de um ciclo fundamental via XOR: caminho1 ⊕ caminho2 ⊕ colisão.
// O prefixo compartilhado (raiz até o LCA) cancela naturalmente.
export function getLoopEdges(loop) {
  const edges = new Set();
  const toggle = (u, v) => {
    const k = edgeKey(u, v);
    if (edges.has(k)) edges.delete(k);
    else edges.add(k);
  };
  const c1 = loop.caminho1, c2 = loop.caminho2;
  for (let i = 0; i < c1.length - 1; i++) toggle(c1[i], c1[i + 1]);
  for (let i = 0; i < c2.length - 1; i++) toggle(c2[i], c2[i + 1]);
  toggle(loop.colisao[0], loop.colisao[1]);
  return edges;
}

export const ORBIT_COLORS = [
  '#ffd66b', '#ff8a6b', '#66c8ff', '#5ad06b', '#b89cff',
  '#ff6bc8', '#f5a623', '#6bf5f5', '#ff5577', '#88ff77',
];
export const orbitColor = (i) => ORBIT_COLORS[i % ORBIT_COLORS.length];

// Cor em gradiente HSL de vermelho (grau 2) a azul (grau 8).
export function degreeColor(d) {
  const t = (d - 2) / 6;
  const hue = Math.round(t * 220);
  return `hsl(${hue}, 75%, 58%)`;
}

// Cor em gradiente da raiz (azul) para as folhas (amarelo).
export function levelColor(lvl, total) {
  const t = lvl / Math.max(1, total - 1);
  const hue = Math.round(220 - t * 180);
  return `hsl(${hue}, 72%, 60%)`;
}
