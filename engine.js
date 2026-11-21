// Kleiner Schach-Computer für Kinder: Alpha-Beta-Suche mit Material und Feldtabellen.
// Stufe 1 = leicht (macht oft Fehler), 2 = mittel, 3 = stark.
import { Chess } from './vendor/chess.js';

const V = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
// Feldtabellen aus Sicht von Weiß (Reihe 8 oben)
const PST = {
  p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
  r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
  q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
};

// Bewertung aus Sicht der Seite am Zug
function evaluate(c) {
  let s = 0; const b = c.board();
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const p = b[r][f]; if (!p) continue;
    const idx = p.color === 'w' ? r * 8 + f : (7 - r) * 8 + f;
    const v = V[p.type] + PST[p.type][idx];
    s += p.color === 'w' ? v : -v;
  }
  return c.turn() === 'w' ? s : -s;
}

function order(moves) {
  return moves.sort((a, b) => score(b) - score(a));
  function score(m) { return (m.captured ? 10 * V[m.captured] - V[m.piece] : 0) + (m.promotion ? 800 : 0) + (m.san.includes('+') ? 50 : 0) }
}

let nodes = 0;
function search(c, depth, alpha, beta, ply) {
  nodes++;
  if (c.isCheckmate()) return -100000 + ply;
  if (c.isDraw()) return 0;
  if (depth === 0) return quiesce(c, alpha, beta, 0);
  for (const m of order(c.moves({ verbose: true }))) {
    c.move(m);
    const v = -search(c, depth - 1, -beta, -alpha, ply + 1);
    c.undo();
    if (v >= beta) return beta;
    if (v > alpha) alpha = v;
  }
  return alpha;
}
function quiesce(c, alpha, beta, d) {
  nodes++;
  const stand = evaluate(c);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;
  if (d >= 4) return alpha;
  for (const m of order(c.moves({ verbose: true }).filter(m => m.captured))) {
    c.move(m);
    const v = -quiesce(c, -beta, -alpha, d + 1);
    c.undo();
    if (v >= beta) return beta;
    if (v > alpha) alpha = v;
  }
  return alpha;
}

export function bestMove(fen, level) {
  const c = new Chess(fen);
  const moves = c.moves({ verbose: true });
  if (!moves.length) return null;
  // leicht: oft ein zufälliger Zug, aber Matt in 1 sieht er
  if (level === 1) {
    const mate = moves.find(m => m.san.endsWith('#'));
    if (mate) return mate.san;
    if (Math.random() < 0.45) return moves[Math.floor(Math.random() * moves.length)].san;
  }
  const depth = level === 3 ? 3 : level === 2 ? 2 : 1;
  nodes = 0;
  let best = [], bestV = -Infinity;
  for (const m of order(moves)) {
    c.move(m);
    let v = -search(c, depth - 1, -Infinity, Infinity, 1);
    c.undo();
    if (level < 3) v += Math.random() * (level === 1 ? 60 : 25); // etwas Abwechslung
    if (v > bestV + 0.5) { bestV = v; best = [m] } else if (Math.abs(v - bestV) <= 0.5) best.push(m);
  }
  return best[Math.floor(Math.random() * best.length)].san;
}
