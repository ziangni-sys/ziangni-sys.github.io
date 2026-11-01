#!/usr/bin/env node
// Writes the two pattern tiles of the page's ground into assets/style.css: 矢絣 (yagasuri), dyed in
// at the head of the page, and 青海波 (seigaiha), rising from its foot. Each tile is the shape of the
// pattern only, an SVG used as a CSS mask; the colours and the fade (ぼかし) are CSS gradients in
// style.css, so the tiles carry no colour at all.
//
// It rewrites only what lies between /* gen:tiles */ and /* /gen:tiles */ in assets/style.css, and
// running it twice gives the same file. Run from anywhere:
//
//   node scripts/ground.js
//
// It also checks that the Genji-kō marks (the brand mark in index.html, the four list marks in
// assets/style.css and assets/favicon.svg) are still exactly what tools/genji/genji.js draws, and
// stops with an error if one is not.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const n = (x) => String(Math.round(x * 1000) / 1000);
// an SVG as a CSS url(): single quotes inside, and the characters CSS and URLs care about escaped
const url = (svg) => 'url("data:image/svg+xml,' + svg.replace(/%/g, '%25').replace(/#/g, '%23')
  .replace(/</g, '%3C').replace(/>/g, '%3E').replace(/"/g, "'") + '")';

/* ------------------------------------------------------------------ 矢絣 yagasuri */

// Columns of arrow fletching, w wide. In each column a dyed feather and an undyed one take turns,
// P being one of each; the next column is dropped by half a motif (P/2), so a dyed feather always
// stands beside an undyed one. Each feather is a chevron pointing up, its point on the shaft (the
// column's centre); the chevron drops by `slant` from the shaft to the edge of the column. The shaft
// is left undyed as a gap `gap` wide, so each dyed feather is drawn as its two vanes.
// The tile is two columns wide and one motif tall; only the dyed feathers are drawn.
function yagasuri(w, P, slant, gap) {
  const f = P / 2;
  const dy = slant * gap / w;            // where the top edge of a vane meets the shaft gap
  const vanes = (x, y) => {
    const c = x + w / 2, g = gap / 2;
    return `M${n(x)} ${n(y + slant)}L${n(c - g)} ${n(y + dy)}V${n(y + dy + f)}L${n(x)} ${n(y + slant + f)}Z` +
      `M${n(x + w)} ${n(y + slant)}L${n(c + g)} ${n(y + dy)}V${n(y + dy + f)}L${n(x + w)} ${n(y + slant + f)}Z`;
  };
  // column 0 starts at y = 0; column 1, dropped by f, runs over the foot of the tile, so its copy
  // one motif up is drawn too, to fill the top edge
  const d = vanes(0, 0) + vanes(w, f) + vanes(w, f - P);
  return {
    size: [2 * w, P],
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='${n(2 * w)}' height='${n(P)}'><path d='${d}'/></svg>`,
  };
}

/* ------------------------------------------------------------------ 青海波 seigaiha */

// Fans of concentric rings (radius R and `rings` more inside it), in rows R/2 apart, alternate rows
// shifted by R. A lower row lies over the row above it and hides what it covers, so the tile is
// drawn as an SVG <mask>: row by row from the top, each fan a black disc (covering the rings behind
// it) and then its rings in white. The row above y = 0 is wholly covered, so it is not drawn.
function seigaiha(R, rings, stroke) {
  const W = 2 * R, H = R;
  const centres = [[0, 0], [W, 0], [R, R / 2], [0, R], [W, R], [R, 1.5 * R]];
  let m = '';
  for (const [cx, cy] of centres) {
    m += `<circle cx='${n(cx)}' cy='${n(cy)}' r='${n(R)}'/><path d='`;
    for (let k = 0; k <= rings; k++) {
      // the outer ring sits just inside its disc, so the next fan's disc never shaves it
      const r = k === 0 ? R - stroke / 2 : R * (1 - k / (rings + 1));
      m += `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 1 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 1 ${n(-2 * r)} 0`;
    }
    m += `'/>`;
  }
  return {
    size: [W, H],
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='${n(W)}' height='${n(H)}'>` +
      `<mask id='m' maskUnits='userSpaceOnUse' x='0' y='0' width='${n(W)}' height='${n(H)}'>` +
      m.replace(/<path d='/g, `<path fill='none' stroke='#fff' stroke-width='${n(stroke)}' d='`) +
      `</mask><rect width='${n(W)}' height='${n(H)}' mask='url(#m)'/></svg>`,
  };
}

/* ------------------------------------------------------------------ write style.css */

const YA = yagasuri(20, 56, 10, 1);
const SG = seigaiha(24, 3, 1.25);
const px = ([w, h]) => `${n(w)}px ${n(h)}px`;
const body = [
  `  --yagasuri: ${url(YA.svg)};`,
  `  --yagasuri-size: ${px(YA.size)};`,
  `  --seigaiha: ${url(SG.svg)};`,
  `  --seigaiha-size: ${px(SG.size)};`,
].join('\n');

const cssFile = path.join(ROOT, 'assets/style.css');
let css = fs.readFileSync(cssFile, 'utf8');
const re = /(\/\* gen:tiles \*\/)[\s\S]*?(\n[ \t]*\/\* \/gen:tiles \*\/)/;
if (!re.test(css)) throw new Error('assets/style.css has no /* gen:tiles */ … /* /gen:tiles */ region');
css = css.replace(re, (_, a, b) => a + '\n' + body + b);
fs.writeFileSync(cssFile, css);

/* ------------------------------------------------------------------ check the Genji-kō marks */

const G = require(path.join(ROOT, 'tools/genji/genji.js'));
const CHAPTERS = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/genji/genji.json'), 'utf8'));
const groups = (ch) => CHAPTERS.find((c) => c.chapter === ch).groups;
const problems = [];

// the brand mark in the masthead: 真木柱 (chapter 31) ringed like a crest, 40 × 40, ring radius 18.6,
// the diagram 21 wide with stroke 1.9, centred
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const mon = G.render(groups(31), { width: 21, stroke: 1.9 });
if (!html.includes(`<circle cx="20" cy="20" r="18.6"/><path transform="translate(9.5 9.5)" stroke-width="1.9" d="${mon}"/></svg>\n      <span class="brand-name">`)) {
  problems.push('index.html: the brand mark is not 真木柱 as drawn by genji.js (width 21, stroke 1.9)');
}
// the list marks: 真木柱, 帚木, 手習, 澪標 at width 13, stroke 1, each written twice (-webkit-mask and mask)
for (const ch of [31, 2, 53, 14]) {
  const d = G.render(groups(ch), { width: 13, stroke: 1 });
  if ((css.split(`d='${d}'`).length - 1) !== 2) problems.push(`assets/style.css: the list mark for chapter ${ch} should appear twice as d='${d}'`);
}
// the favicon: 真木柱, width 34 (stroke 34/9)
const fav = fs.readFileSync(path.join(ROOT, 'assets/favicon.svg'), 'utf8');
if (!fav.includes(`d="${G.render(groups(31), { width: 34 })}"`)) problems.push('assets/favicon.svg: the mark is not 真木柱 as drawn by genji.js (width 34)');

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log('assets/style.css: wrote gen:tiles (yagasuri ' + px(YA.size) + ', seigaiha ' + px(SG.size) +
  '); brand mark, list marks and favicon match genji.js');
