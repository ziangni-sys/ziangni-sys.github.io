# Genji-kō (源氏香) symbols: verified dataset and renderer

> In this repository only the dataset, the two renderers and `check.py` are kept. The contact sheet, `verify_jawiki.py` and the `refs/` folder of downloaded source material mentioned below were used during verification and are not included.

This folder has the 52 Genji-kō answer diagrams (源氏香の図). They run from chapter 2 帚木 to chapter 53 手習. The folder holds a source-checked dataset, a written drawing convention, and the same renderer in JavaScript and Python.

| File | What it is |
|---|---|
| `genji.json` | 52 objects `{chapter, kanji, kana, romaji, english, groups}` in chapter order |
| `genji.js` | Dependency-free UMD module: `require('./genji.js')` in Node, `window.Genji` in a browser. Holds the dataset and the renderer. |
| `genji.py` | The same dataset and renderer in standard-library Python, plus a CLI (`python3 genji.py 39 > yugiri.svg`, `python3 genji.py --all out/`) |
| `contact-sheet.html` / `.png` | All 52 symbols drawn by `genji.js`, labelled with number, kanji and romaji |
| `check.py` | Self-test of the dataset and the geometric rules below (`python3 check.py`) |
| `verify_jawiki.py` | Parses the ja.wikipedia chart `refs/Genjikonozu.PNG` and compares every partition and line level with the dataset (`python3 verify_jawiki.py`; needs Pillow) |
| `refs/` | Downloaded source material and the comparison images used for verification |

---

## 1. Line numbering (used everywhere in this folder)

**Line *r* is the *r*-th incense burned. Line 1 is the rightmost line and line 5 is the leftmost.** `groups` is a set partition of `1..5` in this numbering. Each group is sorted ascending, and the groups are sorted by their first element.

Sources, all of which say the diagram is read from the right:

* ja.wikipedia 「香の図」: 「各線の示す香りは、右から第1香、第2香、…、第5香の順と決まっている」. The article's example is 「2番目の香と5番目の香が同じで、他は全て異なる」 = 藤袴. Here that is `[[1],[2,5],[3],[4]]`.
* ja.wikipedia 「香道」 (雑の部): 「右から、同じ香りであったと思うものを横線でつないでいく」. Its example is 澪標 = 1, 2 and 4 the same, 3 and 5 separate. Here that is `[[1,2,4],[3],[5]]`.
* Iwasaki Yōko (2006), p. 7: 「源氏香之図は，右から順に縦線を5本引く。これが右から順に一炉の香，二炉の香と続き，そして一番左端が五炉の香を示す」. Her example is that 第一香 = 第二香 with the rest different is 空蝉. Here that is `[[1,2],[3],[4],[5]]`.
* Tsukada Akira (2025), p. 94: 「5 本の縦棒が右から番に聞いた香りを表している」 (verbatim as printed; evidently 「右から順番に」).
* The ja.wikipedia chart image `Genjikonozu.PNG` (used in 「香の図」 and 「香道」) is laid out so that the three text examples above only work right to left: its 藤袴 glyph joins the 2nd and 5th lines counted from the right, its 澪標 glyph the 1st, 2nd and 4th, and its 空蝉 glyph the two rightmost lines. Counted from the left, "2nd = 5th" would be 紅梅 and "1st = 2nd" would be 葵.

Some Western sources number the lines **left to right**: Looney's table, the Wikimedia Commons chart, and Skala's font notes ("reading from the left"). Those were converted with *r* = 6 − *L*. The renderer has `order: 'ltr'` if you need the mirrored convention.

## 2. Drawing convention

What follows is what the sources say, plus what can be measured on five independent charts: Tsukada's 52-symbol chart, the ja.wikipedia chart `Genjikonozu.PNG`, the printed 源氏香之図 reproduced as Iwasaki Fig. 1, the Wikimedia Commons SVG, and Kunisada's woodblock series. The renderer follows these rules.

1. **Lines.** Five vertical lines of equal width at equal pitch, all ending on one common baseline. The whole symbol is drawn in a **square**, or very nearly one: Tsukada's glyphs measure 111 × 111 px, the Commons glyphs 51 × 51 units, and the ja.wikipedia glyphs 131 × 126 px.
2. **Joining.** Lines of the same incense are joined **at their tops** by one horizontal bar. ja.wikipedia: 「同香だと思ったものの頭を横線でつなぐ」. Iwasaki: 「同じ香だと思われるものを横線で結ぶ」. The end lines of a group meet the bar in square corners and the inner members meet it in T-joints. Every member of a group stops at its bar. A **singleton** is a plain line with no bar.
3. **Disjoint groups** (spans that do not overlap) all stand at full height. Examples are 若紫, 松風 and 賢木. Looney: "If two groups don't overlap, there is no need to draw them at different heights."
4. **Nesting.** A line lying between two members of another group is **shortened**. A singleton there stops one level lower. A group there gets its whole bar one level lower and all its lines shortened. Examples are 紅葉賀, 花宴 and 藤裏葉. Nesting repeats: 真木柱 `{1,5} > {2,4} > {3}` uses three levels. Apart from the crossing case in rule 5, a line never rises to or above the bar of a group whose span it lies inside. Tsukada: 「複数本を横切って結ばれないように縦方向の長さを調整している」.
5. **Crossing (interleaved groups).** Sometimes each group has a member inside the other's span. In the 52 this happens 10 times. Then one group is drawn a level lower, and **its bar passes straight through one line of the higher group**. This is a "+" crossing, never a T. Skala: "bars joined horizontally or in T-shapes are the same incense, but bars crossing each other are not." Looney: "Sometimes it is impossible to avoid an intersection … it is clear that groups are distinct because the horizontal connecting lines are at different heights." All five charts draw it this way. In the filled styles (Commons, Kunisada) the crossing merges into solid ink, and some Kunisada blocks leave a white nick there. **This is the only case where a line meets a bar it does not belong to.** Which group is on top is **fixed per pattern by tradition**. There is no simple rule for it: Looney's "as tall as possible, nested lower" heuristic fails on 須磨, 初音, 夕霧 and 匂宮. The fallback rule in this repo also misses 初音 and 夕霧. The traditional choices, in incense numbering:

   | ch | | on top | lowered (its bar crosses a line of the top group) |
   |---|---|---|---|
   | 11 | 花散里 Hana Chiru Sato | {2,4} | {1,3} |
   | 12 | 須磨 Suma | {1,4} | {2,3,5} |
   | 17 | 絵合 E Awase | {1,4} | {3,5} |
   | 23 | 初音 Hatsune | {2,4} | {3,5} |
   | 24 | 胡蝶 Kochō | {2,5} | {1,3,4} |
   | 29 | 行幸 Miyuki | {3,5} | {1,2,4} |
   | 39 | 夕霧 Yūgiri | {1,3} | {2,5} |
   | 40 | 御法 Minori | {2,5} | {1,4} |
   | 42 | 匂宮 Niō Miya | {1,3} | {2,4,5} |
   | 52 | 蜻蛉 Kagerō | {1,3,5} | {2,4} |

   夕霧 uses three levels even though two would be enough: {2,5} drops below {1,3}, and {4}, which sits inside {2,5}, drops further. Every chart examined has this, including the ja.wikipedia chart, Kunisada's print and Looney's woodblock example.
6. **Relative bar heights.** The levels are 0 (full height), 1 and 2. Only 真木柱, 夕霧 and 御法 reach level 2. Each level drops by exactly **one line pitch**, which is bar thickness plus one gap. Measured values: Tsukada step 24.5 px for pitch 24.6 px, Commons step 11 for pitch 7 + 4, and ja.wikipedia step 27 px for pitch 19 + 9 = 28 px. As a result, the gap between a lower bar and the bar above it equals the gap between neighbouring lines.
7. **Proportions.** Tsukada splits the symbol into 9 vertical strips: 5 lines and 4 gaps. His measured stroke is 12.4 px and his gap 12.25 px, so strokes and gaps are equal, giving stroke = width/9. That is the renderer's default. The Commons chart is bolder, with stroke:gap = 7:4, and the ja.wikipedia chart bolder still at 19:9. Kunisada's prints are bolder still, solid blocks with hairline gaps. Looney's plain version uses heights 1.0, 0.8 and 0.6 of the box. Stroke weight is a style choice. A square (or near-square) box, a common baseline and step = pitch (to within 1 px) hold across all of them.
8. **Never**: two bars on the same level overlapping, a line ending on another group's bar, or a closed rectangle. An editor's note in the source of ja.wikipedia 「香の図」, commented out there as possible original research, says 「線の組み合わせが他の線の組み合わせを突き抜けて四角形を創ったりはしない」. `check.py` confirms that none of the 52 rendered symbols encloses a region.

## 3. Dataset fields and their sources

* `groups`: the partition, from the sources listed in section 5.
* `kanji`: ja.wikipedia 「源氏物語」 chapter table. The 源氏香 literature and prints also use these variants: 少女/乙女 (21), 朝顔/槿/朝皃 (20), 行幸/御幸 (29), 蛍/螢 (25), 匂宮/匂兵部卿 (42), 賢木/榊 (10), 梅枝/梅が枝 (32), 竹河/竹川 (44), 宿木/寄生 (49). The ja.wikipedia chart labels and the PMJS Tyler list write 21 as 乙女; en.wikipedia writes 25 as 螢.
* `kana`: ja.wikipedia 「源氏物語」 chapter table. It is identical to the labels on the ja.wikipedia chart `Genjikonozu.PNG` for 51 of 52; the exception is 匂宮, noted below. 若菜上 and 若菜下 are given as わかなじょう and わかなげ. 匂宮 is given as におうみや; the article gives におう（の）みや, and the chart labels it におうのみや.
* `romaji`: en.wikipedia "The Tale of Genji" chapter list, using Hepburn with macrons. The colon in "Wakana: Jō" was dropped. Cross-checked against the PMJS list of Tyler's chapter titles (Meiji Gakuin) and against a mechanical Hepburn transliteration of `kana`. Ignoring spaces and case, all 52 agree with both. The one exception is 匂宮, which PMJS writes "Niou Miya", keeping the う of the verb 匂う rather than writing a long ō.
* `chapter`: the same numbering (桐壺 = 1, 雲隠 not counted) in ja.wikipedia, en.wikipedia, the ja.wikipedia chart labels and the PMJS list.
* `english`: the **Seidensticker** column of the same en.wikipedia list. Tyler and Washburn give other renderings; Waley leaves several titles untranslated.

## 4. Renderer API

```js
const Genji = require('./genji.js');            // or <script src="genji.js"> -> window.Genji
Genji.render([[1,3],[2,5],[4]], {width: 100, height: 100, stroke: 100/9, lineCap: 'butt'}); // -> SVG path data
Genji.svg(39, {width: 64, color: '#222'});      // -> full <svg> string (chapter number, kanji, kana or romaji also accepted)
Genji.render(39, {mode: 'fill'});               // -> outline path (union of rectangles) for filling, cutting or fonts
Genji.layout(groups, opts);                     // -> geometry: lines [{line, x, top, bottom, level}], bars [{group, y, x1, x2}]
Genji.chapters; Genji.chapter('夕霧'); Genji.byGroups([[1,3],[2,5],[4]]); Genji.levels(groups);
```

```python
import genji
genji.render([[1, 3], [2, 5], [4]], width=100, stroke=100/9, line_cap="butt")   # path data
genji.svg(39, width=64, color="#222")                                          # full <svg>
# CLI: python3 genji.py 39 > yugiri.svg ; python3 genji.py --all out/ --mode fill --width 120
```

Options:

* `width` defaults to 100.
* `height` defaults to `width`.
* `stroke` defaults to (width − 2·padding)/9.
* `color` defaults to `currentColor`.
* `lineCap` (Python `line_cap`) is `butt`, `square` or `round`. The geometry is adjusted so the outer edge stays exactly inside the box with any cap. With `round`, joins are round too.
* `mode` is `stroke` (centerline path) or `fill` (outline path).
* `padding`, `order` (`rtl` or `ltr`), `levelStep` (default = line pitch) and `levels` (per-line override) are also available.

`render(groups)` only needs the partition. For 5 lines it looks up the traditional layout table, which holds the levels for all 52 patterns. For other line counts (系図香 with 4 lines, 三種香 with 3) it uses the fallback rule. That rule was fitted to the 52 and reproduces 50 of them; it has **not** been checked against real 4- or 3-line charts. JS and Python output were compared on all 52 symbols × 5 option sets and are byte-identical.

## 5. How the partitions were verified

| Source | Kind | Result |
|---|---|---|
| Tsukada 2025, 52-symbol chart on p. 94 | Japanese design-theory paper. Vector chart, parsed programmatically. | The chart is in exact chapter order, read in Japanese column order (right to left, top to bottom, 桐壺 and 夢浮橋 cells empty). **All 52 partitions and all line levels** match Looney. The renderer, at default proportions, reproduces every glyph at pixel IoU 0.91–0.99 (mean 0.954). The differences are only 1-px edge anti-aliasing, see `refs/compare_tsukada.png`. |
| ja.wikipedia chart `Genjikonozu.PNG` (Wikimedia Commons, used in 「香の図」 and 「香道」) | Flat two-colour raster with chapter number, kanji and kana under every glyph. Parsed programmatically by `verify_jawiki.py`; copy in `refs/Genjikonozu.PNG`. | **52/52 partitions and every line level identical**, which includes which group is on top in all 10 crossings and the three levels of 真木柱, 夕霧 and 御法. All 52 labels match `chapter`. They also match `kanji` and `kana`, with two exceptions, both accepted variants: the chart writes 乙女 for 少女 and におうのみや for におうみや. At the chart's own proportions (stroke 19, gap 9, step 27, 131 × 126 px), `genji.js` reproduces every glyph at pixel IoU ≥ 0.98 (mean 0.99), see `refs/compare_jawiki.png`. |
| Looney 2024, table and CSV | Article. Text table, left-to-right numbering. | 52/52 identical after conversion, including his 4 hand-fixed layouts. |
| Iwasaki 2006, Fig. 1 (a printed 源氏香之図) | Scanned halftone, too coarse to parse automatically | Compared by eye cell by cell against our rendering: all 52 consistent, including which group is on top in every crossing. See `refs/papers/iwa_vs_0.png` and `iwa_vs_1.png`. |
| Wikimedia Commons "Genji chapter symbols groupings of 5 elements.svg" | 54-symbol ukiyo-e variant set. SVG parsed programmatically. | 51/52 partitions and line levels identical. The exception is ch. 35, where this set gives 桐壺 (ch. 1) the usual 若菜下 pattern and draws 若菜下 as a variant of 匂宮's pattern. |
| ja.wikipedia 香の図 / 香道, Iwasaki p. 7 | Text examples | 藤袴, 澪標 and 空蝉 confirmed |
| Utagawa Kunisada, 源氏香の図 series, 1845–48 (Tokyo Metropolitan Central Library, via ARC/cultural.jp) | 55 woodblock prints. Crests cropped and inspected. | Useful for the **drawing convention**: crossings, three-level 夕霧 and 御法, shortened singletons. **Not reliable for the mapping.** It is a 54-crest ukiyo-e set: 桐壺 is drawn like 賢木, 夢浮橋 is a zigzag, 紅葉賀 looks like 若紫's pattern, 若菜下 is an outline variant of 藤裏葉's, and 夕顔 has an unclear join at the bottom. Most other crests checked by eye agree with the dataset. |

## 6. Confidence

* **Line numbering (right to left): high.** Four Japanese sources state it explicitly. Three worked examples (藤袴, 澪標, 空蝉) check out against the ja.wikipedia chart, and they would fail if the lines were counted from the left.
* **`groups` for all 52: high.** Tsukada, the ja.wikipedia chart and Looney agree 52/52. The Commons chart agrees 51/52, and its one difference is a known 54-crest variant. The Iwasaki Fig. 1 traditional chart is consistent by eye. Three text examples match. The Tsukada, ja.wikipedia and Commons charts were parsed by code, not by eye.
* **Traditional bar levels, including which group is on top in each crossing: high.** Tsukada, the ja.wikipedia chart and Looney agree 52/52 and Commons 51/52. Iwasaki Fig. 1 and Kunisada agree visually on all crossing cases checked.
* **Drawing convention, structural rules 1–6 and 8: high.** They are stated or illustrated in several sources and hold on every chart examined.
* **Proportions (rule 7): medium.** They are measured from Tsukada's modern chart. Real charts vary in stroke weight, and stroke weight is a style choice.
* **chapter numbers, kanji and kana: high.** They come from ja.wikipedia and match the ja.wikipedia chart labels and the PMJS list. Spelling variants are listed above.
* **romaji: high, from en.wikipedia, checked against PMJS/Tyler and against the kana.** Spacing conventions vary between sources, for example "E Awase" or "Eawase", and "Niō Miya", "Niou Miya" or "Nioumiya".
* **english: medium.** It is Seidensticker's titles as listed on en.wikipedia. Translations differ by translator.
* **Fallback layout for n ≠ 5: low.** It is unverified.

## 7. Sources actually used

* ja.wikipedia 「香の図」: https://ja.wikipedia.org/wiki/香の図. 「源氏香」 itself is a disambiguation page: https://ja.wikipedia.org/wiki/源氏香
* ja.wikipedia 「香道」: https://ja.wikipedia.org/wiki/香道
* ja.wikipedia chart 「源氏香の図」, Wikimedia Commons file `Genjikonozu.PNG` (1459 × 1153): https://commons.wikimedia.org/wiki/File:Genjikonozu.PNG, original at https://upload.wikimedia.org/wikipedia/commons/3/3b/Genjikonozu.PNG
* ja.wikipedia 「源氏物語」 (chapter names and readings): https://ja.wikipedia.org/wiki/源氏物語
* PMJS (Meiji Gakuin), "Chapter (maki) titles in The Tale of Genji, trans. Royall Tyler (2001)": https://wwwres.meijigakuin.ac.jp/~pmjs/resources/genji/tyler-genji.html (with kanji) and https://wwwres.meijigakuin.ac.jp/~pmjs/resources/genji/tyler-genji-rom.html (with macrons)
* en.wikipedia "Kōdō" (Genjikō section; there is no separate "Genji-kō" article): https://en.wikipedia.org/wiki/Kōdō
* en.wikipedia "The Tale of Genji" (chapter list and translations): https://en.wikipedia.org/wiki/The_Tale_of_Genji
* Wikimedia Commons, "Genji chapter symbols groupings of 5 elements.svg": https://upload.wikimedia.org/wikipedia/commons/a/ac/Genji_chapter_symbols_groupings_of_5_elements.svg
* 塚田章 (Tsukada Akira), 「源氏香図パターン・ジェネレータの開発」, デザイン理論 85 (2025 per the repository record; the page header reads 「デザイン理論 85 / 2024」), pp. 94–95: https://ir.library.osaka-u.ac.jp/repo/ouka/all/100291/jjsd85_094.pdf (doi:10.18910/100291)
* 岩崎陽子 (Iwasaki Yōko), 「香りと記号：源氏香之図をめぐって」, デザイン理論 49 (2006), pp. 3–17: https://ir.library.osaka-u.ac.jp/repo/ouka/all/52852/jjsd49_003.pdf (doi:10.18910/52852)
* Oran Looney, "The Art and Mathematics of Genji-Kō" (2024): https://www.oranlooney.com/post/genji-ko/, with the CSV at https://www.oranlooney.com/post/genji-ko_files/genjiko.csv and images
* Matthew Skala, "Genjimon fonts" documentation: https://tsukurimashou.org/genjimon.pdf
* 歌川国貞 「源氏香の図」 series (東京都立中央図書館 加8057-001…055), via cultural.jp / ARC: https://cultural.jp/item/arc_nishikie-KA8057_005, manifests at https://api.cultural.jp/iiif/arc_nishikie-KA8057_NNN/manifest, images at https://data.ukiyo-e.org/metro/images/KA8057-NNN.jpg

## Appendix: all 52 (incense numbering, levels listed for lines 1–5)

| ch | kanji | romaji | groups | levels (line 1→5) | crossing |
|---|---|---|---|---|---|
| 2 | 帚木 | Hahakigi | {1} {2} {3} {4} {5} | 00000 |  |
| 3 | 空蝉 | Utsusemi | {1,2} {3} {4} {5} | 00000 |  |
| 4 | 夕顔 | Yūgao | {1} {2,3} {4} {5} | 00000 |  |
| 5 | 若紫 | Wakamurasaki | {1,2} {3,4} {5} | 00000 |  |
| 6 | 末摘花 | Suetsumuhana | {1} {2,3,4,5} | 00000 |  |
| 7 | 紅葉賀 | Momiji no Ga | {1,3,4} {2} {5} | 01000 |  |
| 8 | 花宴 | Hana no En | {1,3} {2} {4} {5} | 01000 |  |
| 9 | 葵 | Aoi | {1} {2} {3} {4,5} | 00000 |  |
| 10 | 賢木 | Sakaki | {1,2} {3,4,5} | 00000 |  |
| 11 | 花散里 | Hana Chiru Sato | {1,3} {2,4} {5} | 10100 | {2,4} over {1,3} |
| 12 | 須磨 | Suma | {1,4} {2,3,5} | 01101 | {1,4} over {2,3,5} |
| 13 | 明石 | Akashi | {1} {2} {3,4} {5} | 00000 |  |
| 14 | 澪標 | Miotsukushi | {1,2,4} {3} {5} | 00100 |  |
| 15 | 蓬生 | Yomogiu | {1} {2} {3,4,5} | 00000 |  |
| 16 | 関屋 | Sekiya | {1} {2,3,4} {5} | 00000 |  |
| 17 | 絵合 | E Awase | {1,4} {2} {3,5} | 01101 | {1,4} over {3,5} |
| 18 | 松風 | Matsukaze | {1} {2,3} {4,5} | 00000 |  |
| 19 | 薄雲 | Usugumo | {1,2,3,4} {5} | 00000 |  |
| 20 | 朝顔 | Asagao | {1} {2,3,5} {4} | 00010 |  |
| 21 | 少女 | Otome | {1} {2} {3,5} {4} | 00010 |  |
| 22 | 玉鬘 | Tamakazura | {1,2,3} {4,5} | 00000 |  |
| 23 | 初音 | Hatsune | {1} {2,4} {3,5} | 00101 | {2,4} over {3,5} |
| 24 | 胡蝶 | Kochō | {1,3,4} {2,5} | 10110 | {2,5} over {1,3,4} |
| 25 | 蛍 | Hotaru | {1} {2,4,5} {3} | 00100 |  |
| 26 | 常夏 | Tokonatsu | {1,2,3} {4} {5} | 00000 |  |
| 27 | 篝火 | Kagaribi | {1} {2,4} {3} {5} | 00100 |  |
| 28 | 野分 | Nowaki | {1,2} {3} {4,5} | 00000 |  |
| 29 | 行幸 | Miyuki | {1,2,4} {3,5} | 11010 | {3,5} over {1,2,4} |
| 30 | 藤袴 | Fujibakama | {1} {2,5} {3} {4} | 00110 |  |
| 31 | 真木柱 | Makibashira | {1,5} {2,4} {3} | 01210 |  |
| 32 | 梅枝 | Umegae | {1,3,4,5} {2} | 01000 |  |
| 33 | 藤裏葉 | Fuji no Uraba | {1,4} {2,3} {5} | 01100 |  |
| 34 | 若菜上 | Wakana Jō | {1,4,5} {2,3} | 01100 |  |
| 35 | 若菜下 | Wakana Ge | {1,2} {3,5} {4} | 00010 |  |
| 36 | 柏木 | Kashiwagi | {1,3,5} {2} {4} | 01010 |  |
| 37 | 横笛 | Yokobue | {1,2,5} {3} {4} | 00110 |  |
| 38 | 鈴虫 | Suzumushi | {1,5} {2,3} {4} | 01110 |  |
| 39 | 夕霧 | Yūgiri | {1,3} {2,5} {4} | 01021 | {1,3} over {2,5} |
| 40 | 御法 | Minori | {1,4} {2,5} {3} | 10210 | {2,5} over {1,4} |
| 41 | 幻 | Maboroshi | {1,5} {2} {3} {4} | 01110 |  |
| 42 | 匂宮 | Niō Miya | {1,3} {2,4,5} | 01011 | {1,3} over {2,4,5} |
| 43 | 紅梅 | Kōbai | {1,4} {2} {3} {5} | 01100 |  |
| 44 | 竹河 | Takekawa | {1,5} {2,3,4} | 01110 |  |
| 45 | 橋姫 | Hashihime | {1,2,3,5} {4} | 00010 |  |
| 46 | 椎本 | Shii ga Moto | {1} {2,5} {3,4} | 00110 |  |
| 47 | 総角 | Agemaki | {1,2,5} {3,4} | 00110 |  |
| 48 | 早蕨 | Sawarabi | {1,3} {2} {4,5} | 01000 |  |
| 49 | 宿木 | Yadorigi | {1,2,4,5} {3} | 00100 |  |
| 50 | 東屋 | Azumaya | {1,4,5} {2} {3} | 01100 |  |
| 51 | 浮舟 | Ukifune | {1,5} {2} {3,4} | 01110 |  |
| 52 | 蜻蛉 | Kagerō | {1,3,5} {2,4} | 01010 | {1,3,5} over {2,4} |
| 53 | 手習 | Tenarai | {1,2,3,4,5} | 00000 |  |
