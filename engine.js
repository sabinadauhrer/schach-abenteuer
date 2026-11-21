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

// Für die Suche nutzen wir die schnellen internen Funktionen von chess.js (_moves/_makeMove/_undoMove).
// Die normalen moves({verbose:true}) sind etwa 40-mal langsamer und machten den starken Computer sehr träge.
function score(m) { return (m.captured ? 10 * V[m.captured] - V[m.piece] : 0) + (m.promotion ? 800 : 0) }
function order(moves) { return moves.sort((a, b) => score(b) - score(a)) }

let nodes = 0, deadline = Infinity;
export let reached = 0;
class Zeit extends Error {}
const MATE = 100000;
function tick() { if ((++nodes & 1023) === 0 && Date.now() > deadline) throw new Zeit() }
function search(c, depth, alpha, beta, ply) {
  tick();
  const moves = c._moves({ legal: true });
  if (!moves.length) return c.inCheck() ? -MATE + ply : 0;
  if (depth === 0) return quiesce(c, alpha, beta, 0);
  for (const m of order(moves)) {
    c._makeMove(m);
    const v = -search(c, depth - 1, -beta, -alpha, ply + 1);
    c._undoMove();
    if (v >= beta) return beta;
    if (v > alpha) alpha = v;
  }
  return alpha;
}
function quiesce(c, alpha, beta, d) {
  tick();
  const stand = evaluate(c);
  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;
  if (d >= 6) return alpha;
  for (const m of order(c._moves({ legal: true }).filter(m => m.captured || m.promotion))) {
    if (!m.promotion && stand + V[m.captured] + 200 < alpha) continue; // hoffnungslose Schlagzüge überspringen
    c._makeMove(m);
    const v = -quiesce(c, -beta, -alpha, d + 1);
    c._undoMove();
    if (v >= beta) return beta;
    if (v > alpha) alpha = v;
  }
  return alpha;
}

// Denkzeit in Millisekunden je Stufe. Der Computer rechnet immer tiefer, bis die Zeit um ist,
// und nimmt dann den besten Zug der letzten fertigen Suche. So muss niemand lange warten.
const ZEIT = { 1: 300, 2: 500, 3: 1200 };
const sqName = sq => 'abcdefgh'[sq & 15] + (8 - (sq >> 4));

export function bestMove(fen, level) {
  const c = new Chess(fen);
  const pub = c.moves({ verbose: true });
  if (!pub.length) return null;
  const mate = pub.find(m => m.san.endsWith('#'));
  if (mate) return mate.san;
  // leicht: oft ein zufälliger Zug
  if (level === 1 && Math.random() < 0.45) return pub[Math.floor(Math.random() * pub.length)].san;
  const toSan = m => pub.find(p => p.from === sqName(m.from) && p.to === sqName(m.to) && (p.promotion || '') === (m.promotion || '')).san;
  const maxDepth = level === 3 ? 5 : level === 2 ? 2 : 1;
  const noise = level === 1 ? 60 : level === 2 ? 25 : 0;
  reached = 0; nodes = 0; deadline = Date.now() + ZEIT[level];
  let list = order(c._moves({ legal: true })), best = [list[0]];
  for (let depth = 1; depth <= maxDepth; depth++) {
    const scored = [];
    let alpha = -Infinity;
    try {
      for (const m of list) {
        c._makeMove(m);
        // Nullfenster: Züge, die klar schlechter sind, werden nur grob gerechnet
        const v = -search(c, depth - 1, -Infinity, -(alpha - noise - 1), 1) + (noise ? Math.random() * noise : 0);
        c._undoMove();
        scored.push([v, m]);
        if (v > alpha) alpha = v;
      }
    } catch (e) {
      if (!(e instanceof Zeit)) throw e;
      // Zeit um mitten in einer Tiefe: Der erste Zug (bisher bester) ist schon fertig gerechnet.
      // Hat ein anderer Zug ihn übertroffen, nehmen wir den.
      if (scored.length) best = [scored.reduce((a, b) => b[0] > a[0] ? b : a)[1]];
      break;
    }
    scored.sort((a, b) => b[0] - a[0]);
    const top = scored[0][0];
    best = scored.filter(x => x[0] >= top - 0.5).map(x => x[1]);
    list = scored.map(x => x[1]);
    reached = depth;
    if (top > MATE - 100) break; // Matt gefunden
  }
  return toSan(best[Math.floor(Math.random() * best.length)]);
}
