// Übungs-Kapitel nach dem Buch von S. D. Iwaschtschenko „Sammlung von Schachkombinationen“ (1988).
// Die Stellungen stehen in buch_daten.js, hier kommen Kapitel, Titel, Texte und Tipps dazu.
import { BUCH_DATEN } from './buch_daten.js';

export const BUCH_KAPITEL = [
  { id: 'b_m1', name: 'Matt in 1', icon: '🎯', buch: true },
  { id: 'b_dame', name: 'Fang die Dame!', icon: '👸', buch: true },
  { id: 'b_figur', name: 'Turm, Läufer und Springer gewinnen', icon: '🏰', buch: true },
  { id: 'b_dc', name: 'Doppelschach', icon: '⚡', buch: true },
  { id: 'b_opfer', name: 'Opfern und mattsetzen', icon: '🎁', buch: true },
  { id: 'b_wer', name: 'Matt in 2: Wer setzt matt?', icon: '🔍', buch: true },
  { id: 'b_remis', name: 'Rette dich: Remis!', icon: '🛟', buch: true },
  { id: 'b_wie', name: 'Wie würdest du spielen?', icon: '🤔', buch: true },
];

const T = {
  m1: { k: 'b_m1', titel: 'Matt in 1', text: 'Finde den einen Zug, nach dem der König nicht mehr entkommen kann.',
    tipp: 'Schau, welche Felder der König noch hat. Welche Figur kann ihm alle wegnehmen und Schach geben?' },
  winQ: { k: 'b_dame', titel: 'Dame fangen', text: 'Hier kannst du die gegnerische Dame gewinnen!',
    tipp: 'Such eine Gabel, eine Fesselung oder ein Abzugsschach. Die Dame darf nicht mehr fliehen.', ende: 'Du hast die Dame gewonnen!' },
  winR: { k: 'b_figur', titel: 'Turm gewinnen', text: 'Hier kannst du einen Turm gewinnen!',
    tipp: 'Kann eine deiner Figuren zwei Sachen gleichzeitig angreifen?', ende: 'Du hast Material gewonnen!' },
  winB: { k: 'b_figur', titel: 'Läufer gewinnen', text: 'Hier kannst du einen Läufer gewinnen!',
    tipp: 'Ist der Läufer gefesselt oder kann er angegriffen werden, ohne zu fliehen?', ende: 'Du hast Material gewonnen!' },
  winN: { k: 'b_figur', titel: 'Springer gewinnen', text: 'Hier kannst du einen Springer gewinnen!',
    tipp: 'Springer am Rand haben wenig Felder. Kannst du ihn einsperren oder doppelt angreifen?', ende: 'Du hast Material gewonnen!' },
  m2dc: { k: 'b_dc', titel: 'Doppelschach', text: 'Matt in 2 Zügen mit Hilfe eines Doppelschachs.',
    tipp: 'Bei einem Doppelschach geben zwei Figuren gleichzeitig Schach. Dann muss der König laufen!' },
  m2sQ: { k: 'b_opfer', titel: 'Damenopfer', text: 'Matt in 2 Zügen. Dafür musst du deine Dame opfern!',
    tipp: 'Gib die Dame her, damit der König oder eine Figur auf ein schlechtes Feld muss.' },
  m2sR: { k: 'b_opfer', titel: 'Turmopfer', text: 'Matt in 2 Zügen. Dafür musst du einen Turm opfern!',
    tipp: 'Opfere den Turm mit Schach. Danach hat der König keine Felder mehr.' },
  m2sB: { k: 'b_opfer', titel: 'Läuferopfer', text: 'Matt in 2 Zügen. Dafür musst du einen Läufer opfern!',
    tipp: 'Der Läufer opfert sich, damit eine andere Figur durchkommt.' },
  m2sN: { k: 'b_opfer', titel: 'Springeropfer', text: 'Matt in 2 Zügen. Dafür musst du einen Springer opfern!',
    tipp: 'Der Springer springt mitten hinein und lockt den König oder eine Figur weg.' },
  m2Q: { k: 'b_wer', titel: 'Die Dame setzt matt', text: 'Matt in 2 Zügen. Am Ende setzt die Dame matt.',
    tipp: 'Bereite das Matt der Dame vor. Manchmal hilft ein Schach zuerst.' },
  m2R: { k: 'b_wer', titel: 'Der Turm setzt matt', text: 'Matt in 2 Zügen. Am Ende setzt ein Turm matt.',
    tipp: 'Der Turm braucht eine offene Linie oder Reihe zum König.' },
  m2N: { k: 'b_wer', titel: 'Der Springer setzt matt', text: 'Matt in 2 Zügen. Am Ende setzt ein Springer matt.',
    tipp: 'Springer-Matts passieren oft, wenn der König von eigenen Figuren eingesperrt ist.' },
  m2B: { k: 'b_wer', titel: 'Der Läufer setzt matt', text: 'Matt in 2 Zügen. Am Ende setzt ein Läufer matt.',
    tipp: 'Schau auf die Diagonalen, die zum König führen.' },
  m2P: { k: 'b_wer', titel: 'Der Bauer setzt matt', text: 'Matt in 2 Zügen. Am Ende setzt ein Bauer matt!',
    tipp: 'Auch der kleinste Soldat kann den König fangen. Wo kann ein Bauer Schach geben?' },
  draw: { k: 'b_remis', titel: 'Rettung!', text: 'Du stehst schlechter. Finde den Zug, mit dem du noch Remis machst!',
    tipp: 'Denk an Dauerschach oder Patt: Manchmal ist Unentschieden ein toller Erfolg.', ende: 'Gerettet! Das ist Remis.' },
  kak: { k: 'b_wie', titel: 'Wie würdest du spielen?', text: 'Finde den stärksten Zug!',
    tipp: 'Prüfe zuerst alle Schachs, dann alle Schlagzüge, dann alle Drohungen.', ende: 'Super gespielt! Du stehst jetzt klar besser.' },
};

const QUELLE = 'S. D. Iwaschtschenko: Sammlung von Schachkombinationen (1988)';
const nr = {};
export const BUCH_AUFGABEN = BUCH_DATEN.map(([thema, fen, loesung, ziel]) => {
  const t = T[thema];
  nr[t.titel] = (nr[t.titel] || 0) + 1;
  const a = { k: t.k, titel: `${t.titel} ${nr[t.titel]}`, text: t.text, tipp: t.tipp, start: fen + ' - - 0 1',
    loesung: loesung.split(' '), ziel: ziel === 'matt' ? 'matt' : 'gewinn', quelle: QUELLE };
  if (ziel !== 'matt' && t.ende) a.ende = t.ende;
  if (ziel === 'matt' && thema.startsWith('win')) { a.text = 'Hier geht sogar Matt! Finde es.'; }
  return a;
});
