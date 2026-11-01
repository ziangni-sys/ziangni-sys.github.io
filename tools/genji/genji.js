/*!
 * genji.js — Genji-kō (源氏香) symbols: dataset + dependency-free SVG renderer.
 *
 * Works as a CommonJS module (Node: `const Genji = require('./genji.js')`) and as a
 * plain browser <script> (defines `window.Genji`).
 *
 * LINE NUMBERING: line r = the r-th incense burned. Line 1 is the RIGHTMOST line,
 * line 5 the LEFTMOST (diagrams are read right to left). `groups` is a set
 * partition of 1..5 in that numbering, e.g. 夕霧 Yūgiri = [[1,3],[2,5],[4]].
 *
 * DRAWING CONVENTION (see README.md for sources):
 *  - n vertical lines on a common baseline, equal pitch, square overall (W = H).
 *  - Lines of one group are joined at their tops by one horizontal bar (a T or corner
 *    join). Singletons are plain lines with no bar.
 *  - Groups whose spans do not interleave share the top level.
 *  - A line (or group) lying between two members of another group is shortened and
 *    its bar drawn one level lower ("nesting").
 *  - When two groups interleave (crossing), one is drawn a level lower and its bar
 *    passes straight through a line of the higher group (a "+" crossing, never a T).
 *    Which one is lower is fixed by tradition per pattern (table below).
 *  - Level step = line pitch (bar thickness + one gap), so every gap in the
 *    symbol has the same width. Default stroke = width/9 (strokes and gaps equal).
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  if (typeof window !== 'undefined') { window.Genji = api; }
  else if (root && typeof root === 'object') { root.Genji = api; }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /** 52 chapters (2 帚木 … 53 手習). groups use right-to-left numbering (1 = rightmost line). */
  var CHAPTERS = [
    {"chapter": 2, "kanji": "帚木", "kana": "ははきぎ", "romaji": "Hahakigi", "english": "The Broom-Tree", "groups": [[1], [2], [3], [4], [5]]},
    {"chapter": 3, "kanji": "空蝉", "kana": "うつせみ", "romaji": "Utsusemi", "english": "The Shell of the Locust", "groups": [[1, 2], [3], [4], [5]]},
    {"chapter": 4, "kanji": "夕顔", "kana": "ゆうがお", "romaji": "Yūgao", "english": "Evening Faces", "groups": [[1], [2, 3], [4], [5]]},
    {"chapter": 5, "kanji": "若紫", "kana": "わかむらさき", "romaji": "Wakamurasaki", "english": "Lavender", "groups": [[1, 2], [3, 4], [5]]},
    {"chapter": 6, "kanji": "末摘花", "kana": "すえつむはな", "romaji": "Suetsumuhana", "english": "The Safflower", "groups": [[1], [2, 3, 4, 5]]},
    {"chapter": 7, "kanji": "紅葉賀", "kana": "もみじのが", "romaji": "Momiji no Ga", "english": "An Autumn Excursion", "groups": [[1, 3, 4], [2], [5]]},
    {"chapter": 8, "kanji": "花宴", "kana": "はなのえん", "romaji": "Hana no En", "english": "The Festival of the Cherry Blossoms", "groups": [[1, 3], [2], [4], [5]]},
    {"chapter": 9, "kanji": "葵", "kana": "あおい", "romaji": "Aoi", "english": "Heartvine", "groups": [[1], [2], [3], [4, 5]]},
    {"chapter": 10, "kanji": "賢木", "kana": "さかき", "romaji": "Sakaki", "english": "The Sacred Tree", "groups": [[1, 2], [3, 4, 5]]},
    {"chapter": 11, "kanji": "花散里", "kana": "はなちるさと", "romaji": "Hana Chiru Sato", "english": "The Orange Blossoms", "groups": [[1, 3], [2, 4], [5]]},
    {"chapter": 12, "kanji": "須磨", "kana": "すま", "romaji": "Suma", "english": "Suma", "groups": [[1, 4], [2, 3, 5]]},
    {"chapter": 13, "kanji": "明石", "kana": "あかし", "romaji": "Akashi", "english": "Akashi", "groups": [[1], [2], [3, 4], [5]]},
    {"chapter": 14, "kanji": "澪標", "kana": "みおつくし", "romaji": "Miotsukushi", "english": "Channel Buoys", "groups": [[1, 2, 4], [3], [5]]},
    {"chapter": 15, "kanji": "蓬生", "kana": "よもぎう", "romaji": "Yomogiu", "english": "The Wormwood Patch", "groups": [[1], [2], [3, 4, 5]]},
    {"chapter": 16, "kanji": "関屋", "kana": "せきや", "romaji": "Sekiya", "english": "The Gatehouse", "groups": [[1], [2, 3, 4], [5]]},
    {"chapter": 17, "kanji": "絵合", "kana": "えあわせ", "romaji": "E Awase", "english": "A Picture Contest", "groups": [[1, 4], [2], [3, 5]]},
    {"chapter": 18, "kanji": "松風", "kana": "まつかぜ", "romaji": "Matsukaze", "english": "The Wind in the Pines", "groups": [[1], [2, 3], [4, 5]]},
    {"chapter": 19, "kanji": "薄雲", "kana": "うすぐも", "romaji": "Usugumo", "english": "A Rack of Clouds", "groups": [[1, 2, 3, 4], [5]]},
    {"chapter": 20, "kanji": "朝顔", "kana": "あさがお", "romaji": "Asagao", "english": "The Morning Glory", "groups": [[1], [2, 3, 5], [4]]},
    {"chapter": 21, "kanji": "少女", "kana": "おとめ", "romaji": "Otome", "english": "The Maiden", "groups": [[1], [2], [3, 5], [4]]},
    {"chapter": 22, "kanji": "玉鬘", "kana": "たまかずら", "romaji": "Tamakazura", "english": "The Jewelled Chaplet", "groups": [[1, 2, 3], [4, 5]]},
    {"chapter": 23, "kanji": "初音", "kana": "はつね", "romaji": "Hatsune", "english": "The First Warbler", "groups": [[1], [2, 4], [3, 5]]},
    {"chapter": 24, "kanji": "胡蝶", "kana": "こちょう", "romaji": "Kochō", "english": "Butterflies", "groups": [[1, 3, 4], [2, 5]]},
    {"chapter": 25, "kanji": "蛍", "kana": "ほたる", "romaji": "Hotaru", "english": "Fireflies", "groups": [[1], [2, 4, 5], [3]]},
    {"chapter": 26, "kanji": "常夏", "kana": "とこなつ", "romaji": "Tokonatsu", "english": "Wild Carnation", "groups": [[1, 2, 3], [4], [5]]},
    {"chapter": 27, "kanji": "篝火", "kana": "かがりび", "romaji": "Kagaribi", "english": "Flares", "groups": [[1], [2, 4], [3], [5]]},
    {"chapter": 28, "kanji": "野分", "kana": "のわき", "romaji": "Nowaki", "english": "The Typhoon", "groups": [[1, 2], [3], [4, 5]]},
    {"chapter": 29, "kanji": "行幸", "kana": "みゆき", "romaji": "Miyuki", "english": "The Royal Outing", "groups": [[1, 2, 4], [3, 5]]},
    {"chapter": 30, "kanji": "藤袴", "kana": "ふじばかま", "romaji": "Fujibakama", "english": "Purple Trousers", "groups": [[1], [2, 5], [3], [4]]},
    {"chapter": 31, "kanji": "真木柱", "kana": "まきばしら", "romaji": "Makibashira", "english": "The Cypress Pillar", "groups": [[1, 5], [2, 4], [3]]},
    {"chapter": 32, "kanji": "梅枝", "kana": "うめがえ", "romaji": "Umegae", "english": "A Branch of Plum", "groups": [[1, 3, 4, 5], [2]]},
    {"chapter": 33, "kanji": "藤裏葉", "kana": "ふじのうらば", "romaji": "Fuji no Uraba", "english": "Wisteria Leaves", "groups": [[1, 4], [2, 3], [5]]},
    {"chapter": 34, "kanji": "若菜上", "kana": "わかなじょう", "romaji": "Wakana Jō", "english": "New Herbs, Part I", "groups": [[1, 4, 5], [2, 3]]},
    {"chapter": 35, "kanji": "若菜下", "kana": "わかなげ", "romaji": "Wakana Ge", "english": "New Herbs, Part II", "groups": [[1, 2], [3, 5], [4]]},
    {"chapter": 36, "kanji": "柏木", "kana": "かしわぎ", "romaji": "Kashiwagi", "english": "The Oak Tree", "groups": [[1, 3, 5], [2], [4]]},
    {"chapter": 37, "kanji": "横笛", "kana": "よこぶえ", "romaji": "Yokobue", "english": "The Flute", "groups": [[1, 2, 5], [3], [4]]},
    {"chapter": 38, "kanji": "鈴虫", "kana": "すずむし", "romaji": "Suzumushi", "english": "The Bell Cricket", "groups": [[1, 5], [2, 3], [4]]},
    {"chapter": 39, "kanji": "夕霧", "kana": "ゆうぎり", "romaji": "Yūgiri", "english": "Evening Mist", "groups": [[1, 3], [2, 5], [4]]},
    {"chapter": 40, "kanji": "御法", "kana": "みのり", "romaji": "Minori", "english": "Rites", "groups": [[1, 4], [2, 5], [3]]},
    {"chapter": 41, "kanji": "幻", "kana": "まぼろし", "romaji": "Maboroshi", "english": "The Wizard", "groups": [[1, 5], [2], [3], [4]]},
    {"chapter": 42, "kanji": "匂宮", "kana": "におうみや", "romaji": "Niō Miya", "english": "His Perfumed Highness", "groups": [[1, 3], [2, 4, 5]]},
    {"chapter": 43, "kanji": "紅梅", "kana": "こうばい", "romaji": "Kōbai", "english": "The Rose Plum", "groups": [[1, 4], [2], [3], [5]]},
    {"chapter": 44, "kanji": "竹河", "kana": "たけかわ", "romaji": "Takekawa", "english": "Bamboo River", "groups": [[1, 5], [2, 3, 4]]},
    {"chapter": 45, "kanji": "橋姫", "kana": "はしひめ", "romaji": "Hashihime", "english": "The Lady at the Bridge", "groups": [[1, 2, 3, 5], [4]]},
    {"chapter": 46, "kanji": "椎本", "kana": "しいがもと", "romaji": "Shii ga Moto", "english": "Beneath the Oak", "groups": [[1], [2, 5], [3, 4]]},
    {"chapter": 47, "kanji": "総角", "kana": "あげまき", "romaji": "Agemaki", "english": "Trefoil Knots", "groups": [[1, 2, 5], [3, 4]]},
    {"chapter": 48, "kanji": "早蕨", "kana": "さわらび", "romaji": "Sawarabi", "english": "Early Ferns", "groups": [[1, 3], [2], [4, 5]]},
    {"chapter": 49, "kanji": "宿木", "kana": "やどりぎ", "romaji": "Yadorigi", "english": "The Ivy", "groups": [[1, 2, 4, 5], [3]]},
    {"chapter": 50, "kanji": "東屋", "kana": "あずまや", "romaji": "Azumaya", "english": "The Eastern Cottage", "groups": [[1, 4, 5], [2], [3]]},
    {"chapter": 51, "kanji": "浮舟", "kana": "うきふね", "romaji": "Ukifune", "english": "A Boat upon the Waters", "groups": [[1, 5], [2], [3, 4]]},
    {"chapter": 52, "kanji": "蜻蛉", "kana": "かげろう", "romaji": "Kagerō", "english": "The Drake Fly", "groups": [[1, 3, 5], [2, 4]]},
    {"chapter": 53, "kanji": "手習", "kana": "てならい", "romaji": "Tenarai", "english": "The Writing Practice", "groups": [[1, 2, 3, 4, 5]]}
  ];

  /**
   * Traditional level (0 = full height, 1 = one step lower, 2 = two steps lower) of each
   * line 1..5, keyed by canonical partition. Read off the 52-symbol chart in Tsukada (2025);
   * identical to the ja.wikipedia chart Genjikonozu.PNG and to Looney (2024) for all 52 patterns,
   * and to the Wikimedia Commons chart for 51 (that 54-symbol set draws 若菜下 differently).
   */
  var TRADITIONAL_LEVELS = {
    "1|2|3|4|5": [0, 0, 0, 0, 0],
    "1,2|3|4|5": [0, 0, 0, 0, 0],
    "1|2,3|4|5": [0, 0, 0, 0, 0],
    "1,2|3,4|5": [0, 0, 0, 0, 0],
    "1|2,3,4,5": [0, 0, 0, 0, 0],
    "1,3,4|2|5": [0, 1, 0, 0, 0],
    "1,3|2|4|5": [0, 1, 0, 0, 0],
    "1|2|3|4,5": [0, 0, 0, 0, 0],
    "1,2|3,4,5": [0, 0, 0, 0, 0],
    "1,3|2,4|5": [1, 0, 1, 0, 0],
    "1,4|2,3,5": [0, 1, 1, 0, 1],
    "1|2|3,4|5": [0, 0, 0, 0, 0],
    "1,2,4|3|5": [0, 0, 1, 0, 0],
    "1|2|3,4,5": [0, 0, 0, 0, 0],
    "1|2,3,4|5": [0, 0, 0, 0, 0],
    "1,4|2|3,5": [0, 1, 1, 0, 1],
    "1|2,3|4,5": [0, 0, 0, 0, 0],
    "1,2,3,4|5": [0, 0, 0, 0, 0],
    "1|2,3,5|4": [0, 0, 0, 1, 0],
    "1|2|3,5|4": [0, 0, 0, 1, 0],
    "1,2,3|4,5": [0, 0, 0, 0, 0],
    "1|2,4|3,5": [0, 0, 1, 0, 1],
    "1,3,4|2,5": [1, 0, 1, 1, 0],
    "1|2,4,5|3": [0, 0, 1, 0, 0],
    "1,2,3|4|5": [0, 0, 0, 0, 0],
    "1|2,4|3|5": [0, 0, 1, 0, 0],
    "1,2|3|4,5": [0, 0, 0, 0, 0],
    "1,2,4|3,5": [1, 1, 0, 1, 0],
    "1|2,5|3|4": [0, 0, 1, 1, 0],
    "1,5|2,4|3": [0, 1, 2, 1, 0],
    "1,3,4,5|2": [0, 1, 0, 0, 0],
    "1,4|2,3|5": [0, 1, 1, 0, 0],
    "1,4,5|2,3": [0, 1, 1, 0, 0],
    "1,2|3,5|4": [0, 0, 0, 1, 0],
    "1,3,5|2|4": [0, 1, 0, 1, 0],
    "1,2,5|3|4": [0, 0, 1, 1, 0],
    "1,5|2,3|4": [0, 1, 1, 1, 0],
    "1,3|2,5|4": [0, 1, 0, 2, 1],
    "1,4|2,5|3": [1, 0, 2, 1, 0],
    "1,5|2|3|4": [0, 1, 1, 1, 0],
    "1,3|2,4,5": [0, 1, 0, 1, 1],
    "1,4|2|3|5": [0, 1, 1, 0, 0],
    "1,5|2,3,4": [0, 1, 1, 1, 0],
    "1,2,3,5|4": [0, 0, 0, 1, 0],
    "1|2,5|3,4": [0, 0, 1, 1, 0],
    "1,2,5|3,4": [0, 0, 1, 1, 0],
    "1,3|2|4,5": [0, 1, 0, 0, 0],
    "1,2,4,5|3": [0, 0, 1, 0, 0],
    "1,4,5|2|3": [0, 1, 1, 0, 0],
    "1,5|2|3,4": [0, 1, 1, 1, 0],
    "1,3,5|2,4": [0, 1, 0, 1, 0],
    "1,2,3,4,5": [0, 0, 0, 0, 0]
  };

  function key(groups) {
    return groups.map(function (g) { return g.slice().sort(function (a, b) { return a - b; }); })
      .sort(function (a, b) { return a[0] - b[0]; })
      .map(function (g) { return g.join(','); }).join('|');
  }

  function normalize(groups) {
    if (typeof groups === 'number' || typeof groups === 'string') {
      var c = chapter(groups);
      if (!c) { throw new Error('Unknown chapter: ' + groups); }
      return c.groups.map(function (g) { return g.slice(); });
    }
    if (!Array.isArray(groups) || !groups.length) { throw new Error('groups must be a non-empty array of arrays'); }
    var seen = {}, n = 0;
    groups.forEach(function (g) {
      if (!Array.isArray(g) || !g.length) { throw new Error('each group must be a non-empty array'); }
      g.forEach(function (x) {
        if (x !== Math.floor(x) || x < 1) { throw new Error('line numbers must be positive integers'); }
        if (seen[x]) { throw new Error('line ' + x + ' appears twice'); }
        seen[x] = true; n++;
      });
    });
    for (var i = 1; i <= n; i++) { if (!seen[i]) { throw new Error('groups must partition 1..' + n + ' (missing ' + i + ')'); } }
    return groups.map(function (g) { return g.slice().sort(function (a, b) { return a - b; }); })
      .sort(function (a, b) { return a[0] - b[0]; });
  }

  function chapter(q) {
    for (var i = 0; i < CHAPTERS.length; i++) {
      var c = CHAPTERS[i];
      if (c.chapter === q || c.kanji === q || c.kana === q ||
          (typeof q === 'string' && c.romaji.toLowerCase() === q.toLowerCase())) { return c; }
    }
    return null;
  }

  function byGroups(groups) {
    var k = key(normalize(groups));
    for (var i = 0; i < CHAPTERS.length; i++) { if (key(CHAPTERS[i].groups) === k) { return CHAPTERS[i]; } }
    return null;
  }

  /**
   * Fallback level assignment for partitions not in the traditional table (e.g. n != 5).
   * Nested groups go below the group that encloses them; for interleaved groups the one that
   * encloses more foreign lines goes on top, ties -> shorter span on top, then the left one.
   * Levels are then the longest path in the resulting "above" graph (as tall as possible).
   * For n = 5 this rule (fitted by inspection) reproduces 50 of the 52 traditional symbols (not
   * 初音 Hatsune, 夕霧 Yūgiri); for n = 5 the traditional table is always used instead.
   */
  function autoLevels(groups, n) {
    var G = groups.map(function (g) {
      var cols = g.map(function (r) { return n - r; });           // visual column, 0 = leftmost
      return { lo: Math.min.apply(null, cols), hi: Math.max.apply(null, cols), cols: cols };
    });
    function inside(A, B) { // number of B's columns strictly inside A's span
      return B.cols.filter(function (c) { return c > A.lo && c < A.hi; }).length;
    }
    function covered(A, B) { // foreign columns strictly inside A's span, from B
      return inside(A, B);
    }
    var above = G.map(function () { return []; });              // above[j] = list of i that must be above j
    for (var i = 0; i < G.length; i++) {
      for (var j = i + 1; j < G.length; j++) {
        var iCoversJ = covered(G[i], G[j]) > 0, jCoversI = covered(G[j], G[i]) > 0;
        if (iCoversJ && !jCoversI) { above[j].push(i); }
        else if (jCoversI && !iCoversJ) { above[i].push(j); }
        else if (iCoversJ && jCoversI) {
          var fi = G[i].hi - G[i].lo - G[i].cols.length + 1, fj = G[j].hi - G[j].lo - G[j].cols.length + 1;
          var top;
          if (fi !== fj) { top = fi > fj ? i : j; }
          else if ((G[i].hi - G[i].lo) !== (G[j].hi - G[j].lo)) { top = (G[i].hi - G[i].lo) < (G[j].hi - G[j].lo) ? i : j; }
          else { top = G[i].lo < G[j].lo ? i : j; }
          if (top === i) { above[j].push(i); } else { above[i].push(j); }
        }
      }
    }
    var memo = {};
    function lvl(j, depth) {
      if (memo[j] !== undefined) { return memo[j]; }
      if (depth > G.length) { throw new Error('cyclic layout'); }
      var m = 0;
      above[j].forEach(function (i) { m = Math.max(m, lvl(i, depth + 1) + 1); });
      return (memo[j] = m);
    }
    var levels = new Array(n);
    groups.forEach(function (g, gi) { var L = lvl(gi, 0); g.forEach(function (r) { levels[r - 1] = L; }); });
    return levels;
  }

  function levelsFor(groups, n) {
    if (n === 5) {
      var t = TRADITIONAL_LEVELS[key(groups)];
      if (t) { return t.slice(); }
    }
    return autoLevels(groups, n);
  }

  function num(x) { return String(Math.round(x * 1000) / 1000); }

  /**
   * Compute the geometry. Returns { width, height, stroke, n, levels, lines:[...], bars:[...] }.
   * Coordinates are stroke centerlines; y grows downward (SVG).
   */
  function layout(groups, opts) {
    opts = opts || {};
    var gs = normalize(groups);
    var n = gs.reduce(function (s, g) { return s + g.length; }, 0);
    var W = +opts.width || 100;
    var H = +(opts.height || W);
    var pad = +opts.padding || 0;
    var sw = opts.stroke != null ? +opts.stroke : (W - 2 * pad) / (2 * n - 1);
    var cap = opts.lineCap || 'butt';
    var ltr = opts.order === 'ltr';
    var levels = opts.levels ? opts.levels.slice() : levelsFor(gs, n);
    var maxL = Math.max.apply(null, levels);
    var pitch = (W - 2 * pad - sw) / (n - 1);
    var step = opts.levelStep != null ? +opts.levelStep : pitch;
    if (maxL > 0) { step = Math.min(step, (H - 2 * pad - sw) * 0.6 / maxL); }
    var bottom = H - pad - (cap === 'butt' ? 0 : sw / 2);
    function x(r) { var c = ltr ? r - 1 : n - r; return pad + sw / 2 + c * pitch; }
    function y(level) { return pad + sw / 2 + level * step; }
    var lines = [], bars = [];
    gs.forEach(function (g) {
      var L = levels[g[0] - 1];
      g.forEach(function (r) {
        var top = y(L);
        if (g.length === 1 && cap === 'butt') { top -= sw / 2; }   // singleton top flush with bar tops
        lines.push({ line: r, x: x(r), top: top, bottom: bottom, topEdge: y(L) - sw / 2, bottomEdge: H - pad, level: L, group: g });
      });
      if (g.length > 1) {
        var xs = g.map(x);
        bars.push({ group: g, level: L, y: y(L), x1: Math.min.apply(null, xs), x2: Math.max.apply(null, xs) });
      }
    });
    return { width: W, height: H, stroke: sw, lineCap: cap, n: n, levels: levels, groups: gs, lines: lines, bars: bars };
  }

  /**
   * SVG path data for the symbol.
   * opts: width (100), height (=width), stroke (width/9 for 5 lines), lineCap ('butt'|'square'|'round'),
   *       padding (0), order ('rtl' default | 'ltr'), mode ('stroke' default | 'fill'),
   *       levelStep (default = line pitch), levels (override per-line levels).
   * mode 'stroke': centerline path, to be stroked with stroke-width = opts.stroke.
   * mode 'fill'  : outline path (union of rectangles, nonzero rule), to be filled; lineCap ignored.
   */
  function render(groups, opts) {
    opts = opts || {};
    var g = layout(groups, opts), sw = g.stroke, d = [];
    if (opts.mode === 'fill') {
      var h = sw / 2;
      var rect = function (x0, y0, x1, y1) { d.push('M' + num(x0) + ' ' + num(y0) + 'H' + num(x1) + 'V' + num(y1) + 'H' + num(x0) + 'Z'); };
      g.lines.forEach(function (l) { rect(l.x - h, l.topEdge, l.x + h, l.bottomEdge); });
      g.bars.forEach(function (b) { rect(b.x1 - h, b.y - h, b.x2 + h, b.y + h); });
      return d.join('');
    }
    g.groups.forEach(function (grp) {
      var ls = g.lines.filter(function (l) { return l.group === grp; }).sort(function (a, b) { return a.x - b.x; });
      if (ls.length === 1) { d.push('M' + num(ls[0].x) + ' ' + num(ls[0].bottom) + 'V' + num(ls[0].top)); return; }
      var a = ls[0], z = ls[ls.length - 1];
      d.push('M' + num(a.x) + ' ' + num(a.bottom) + 'V' + num(a.top) + 'H' + num(z.x) + 'V' + num(z.bottom));
      ls.slice(1, -1).forEach(function (m) { d.push('M' + num(m.x) + ' ' + num(m.bottom) + 'V' + num(m.top)); });
    });
    return d.join('');
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /** Full standalone <svg> string. Extra opts: color ('currentColor'), title, className. */
  function svg(groups, opts) {
    opts = opts || {};
    var g = layout(groups, opts);
    var color = opts.color || 'currentColor';
    var d = render(groups, opts);
    var title = opts.title;
    if (title === undefined && (typeof groups === 'number' || typeof groups === 'string')) {
      var c = chapter(groups); if (c) { title = c.chapter + ' ' + c.kanji + ' ' + c.romaji; }
    }
    var attrs = opts.mode === 'fill'
      ? 'fill="' + esc(color) + '" fill-rule="nonzero"'
      : 'fill="none" stroke="' + esc(color) + '" stroke-width="' + num(g.stroke) + '" stroke-linecap="' + esc(g.lineCap) +
        '" stroke-linejoin="' + (g.lineCap === 'round' ? 'round' : 'miter') + '" stroke-miterlimit="4"';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + num(g.width) + ' ' + num(g.height) +
      '" width="' + num(g.width) + '" height="' + num(g.height) + '"' +
      (opts.className ? ' class="' + esc(opts.className) + '"' : '') + ' role="img"' +
      (title ? ' aria-label="' + esc(title) + '"' : '') + '>' +
      (title ? '<title>' + esc(title) + '</title>' : '') +
      '<path d="' + d + '" ' + attrs + '/></svg>';
  }

  return {
    CHAPTERS: CHAPTERS,
    chapters: CHAPTERS,
    TRADITIONAL_LEVELS: TRADITIONAL_LEVELS,
    chapter: chapter,
    byGroups: byGroups,
    key: key,
    levels: function (groups) { var g = normalize(groups); return levelsFor(g, g.reduce(function (s, x) { return s + x.length; }, 0)); },
    autoLevels: function (groups) { var g = normalize(groups); return autoLevels(g, g.reduce(function (s, x) { return s + x.length; }, 0)); },
    layout: layout,
    render: render,
    svg: svg
  };
}));
