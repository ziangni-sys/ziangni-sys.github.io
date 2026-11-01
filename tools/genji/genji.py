#!/usr/bin/env python3
"""genji.py - Genji-ko (源氏香) symbols: dataset + dependency-free SVG renderer.

Same geometry as genji.js. Standard library only (Python 3.7+).

LINE NUMBERING: line r = the r-th incense burned. Line 1 is the RIGHTMOST line,
line 5 the LEFTMOST (diagrams are read right to left). ``groups`` is a set
partition of 1..5 in that numbering, e.g. 夕霧 Yugiri = [[1, 3], [2, 5], [4]].

Usage as a library::

    import genji
    d = genji.render([[1, 3], [2, 5], [4]], width=100, stroke=100/9)   # path data
    s = genji.svg(39, width=64, color="#222")                           # full <svg>

Command line::

    python3 genji.py 39 > yugiri.svg              # by chapter number
    python3 genji.py 夕霧 --mode fill > y.svg       # by kanji / kana / romaji
    python3 genji.py --all OUTDIR [--width 120]     # 52 files: 02-hahakigi.svg ...
"""
import json
import sys

# 52 chapters (2 帚木 ... 53 手習); groups use right-to-left numbering (1 = rightmost line).
CHAPTERS = json.loads(r'''[
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
]''')

# Traditional level (0 = full height, 1 = one step lower, 2 = two steps lower) of each line 1..5,
# keyed by canonical partition. Read off the 52-symbol chart in Tsukada (2025); identical to the
# ja.wikipedia chart Genjikonozu.PNG and to Looney (2024) for all 52 patterns, and to the Wikimedia
# Commons chart for 51 (that 54-symbol set draws 若菜下 differently).
TRADITIONAL_LEVELS = json.loads(r'''{
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
}''')


def key(groups):
    gs = sorted((sorted(g) for g in groups), key=lambda g: g[0])
    return "|".join(",".join(str(x) for x in g) for g in gs)


def chapter(q):
    for c in CHAPTERS:
        if c["chapter"] == q or c["kanji"] == q or c["kana"] == q:
            return c
        if isinstance(q, str) and (c["romaji"].lower() == q.lower() or q.isdigit() and int(q) == c["chapter"]):
            return c
    return None


def normalize(groups):
    if isinstance(groups, (int, str)):
        c = chapter(groups)
        if c is None:
            raise ValueError("Unknown chapter: %r" % (groups,))
        return [list(g) for g in c["groups"]]
    if not groups:
        raise ValueError("groups must be a non-empty list of lists")
    seen = set()
    for g in groups:
        if not g:
            raise ValueError("each group must be non-empty")
        for x in g:
            if not isinstance(x, int) or x < 1:
                raise ValueError("line numbers must be positive integers")
            if x in seen:
                raise ValueError("line %d appears twice" % x)
            seen.add(x)
    n = len(seen)
    for i in range(1, n + 1):
        if i not in seen:
            raise ValueError("groups must partition 1..%d (missing %d)" % (n, i))
    return sorted((sorted(g) for g in groups), key=lambda g: g[0])


def by_groups(groups):
    k = key(normalize(groups))
    for c in CHAPTERS:
        if key(c["groups"]) == k:
            return c
    return None


def auto_levels(groups, n):
    """Fallback for partitions not in the traditional table (e.g. n != 5); see genji.js."""
    G = []
    for g in groups:
        cols = [n - r for r in g]
        G.append({"lo": min(cols), "hi": max(cols), "cols": cols})

    def covered(A, B):
        return sum(1 for c in B["cols"] if A["lo"] < c < A["hi"])

    above = [[] for _ in G]
    for i in range(len(G)):
        for j in range(i + 1, len(G)):
            ij, ji = covered(G[i], G[j]) > 0, covered(G[j], G[i]) > 0
            if ij and not ji:
                above[j].append(i)
            elif ji and not ij:
                above[i].append(j)
            elif ij and ji:
                fi = G[i]["hi"] - G[i]["lo"] - len(G[i]["cols"]) + 1
                fj = G[j]["hi"] - G[j]["lo"] - len(G[j]["cols"]) + 1
                if fi != fj:
                    top = i if fi > fj else j
                elif (G[i]["hi"] - G[i]["lo"]) != (G[j]["hi"] - G[j]["lo"]):
                    top = i if (G[i]["hi"] - G[i]["lo"]) < (G[j]["hi"] - G[j]["lo"]) else j
                else:
                    top = i if G[i]["lo"] < G[j]["lo"] else j
                if top == i:
                    above[j].append(i)
                else:
                    above[i].append(j)
    memo = {}

    def lvl(j, depth=0):
        if j in memo:
            return memo[j]
        if depth > len(G):
            raise ValueError("cyclic layout")
        m = 0
        for i in above[j]:
            m = max(m, lvl(i, depth + 1) + 1)
        memo[j] = m
        return m

    levels = [0] * n
    for gi, g in enumerate(groups):
        L = lvl(gi)
        for r in g:
            levels[r - 1] = L
    return levels


def levels_for(groups, n=None):
    n = n or sum(len(g) for g in groups)
    if n == 5:
        t = TRADITIONAL_LEVELS.get(key(groups))
        if t:
            return list(t)
    return auto_levels(groups, n)


def _num(x):
    v = round(x * 1000) / 1000
    return str(int(v)) if v == int(v) else repr(v)


def layout(groups, width=100, height=None, stroke=None, line_cap="butt", padding=0,
           order="rtl", level_step=None, levels=None, **_ignored):
    """Geometry of the symbol (stroke centerlines, y downward)."""
    gs = normalize(groups)
    n = sum(len(g) for g in gs)
    W = float(width)
    H = float(height if height is not None else width)
    pad = float(padding or 0)
    sw = float(stroke) if stroke is not None else (W - 2 * pad) / (2 * n - 1)
    cap = line_cap or "butt"
    lv = list(levels) if levels else levels_for(gs, n)
    maxL = max(lv)
    pitch = (W - 2 * pad - sw) / (n - 1)
    step = float(level_step) if level_step is not None else pitch
    if maxL > 0:
        step = min(step, (H - 2 * pad - sw) * 0.6 / maxL)
    bottom = H - pad - (0 if cap == "butt" else sw / 2)

    def x(r):
        c = r - 1 if order == "ltr" else n - r
        return pad + sw / 2 + c * pitch

    def y(level):
        return pad + sw / 2 + level * step

    lines, bars = [], []
    for g in gs:
        L = lv[g[0] - 1]
        for r in g:
            top = y(L)
            if len(g) == 1 and cap == "butt":
                top -= sw / 2
            lines.append({"line": r, "x": x(r), "top": top, "bottom": bottom,
                          "topEdge": y(L) - sw / 2, "bottomEdge": H - pad, "level": L, "group": g})
        if len(g) > 1:
            xs = [x(r) for r in g]
            bars.append({"group": g, "level": L, "y": y(L), "x1": min(xs), "x2": max(xs)})
    return {"width": W, "height": H, "stroke": sw, "lineCap": cap, "n": n, "levels": lv,
            "groups": gs, "lines": lines, "bars": bars}


def render(groups, width=100, height=None, stroke=None, line_cap="butt", padding=0,
           order="rtl", mode="stroke", level_step=None, levels=None, **kw):
    """SVG path data. mode='stroke': centerlines to be stroked with stroke-width=stroke.
    mode='fill': union of rectangles (nonzero) to be filled."""
    line_cap = kw.pop("lineCap", line_cap)
    g = layout(groups, width, height, stroke, line_cap, padding, order, level_step, levels)
    sw = g["stroke"]
    d = []
    if mode == "fill":
        h = sw / 2

        def rect(x0, y0, x1, y1):
            d.append("M%s %sH%sV%sH%sZ" % (_num(x0), _num(y0), _num(x1), _num(y1), _num(x0)))

        for l in g["lines"]:
            rect(l["x"] - h, l["topEdge"], l["x"] + h, l["bottomEdge"])
        for b in g["bars"]:
            rect(b["x1"] - h, b["y"] - h, b["x2"] + h, b["y"] + h)
        return "".join(d)
    for grp in g["groups"]:
        ls = sorted((l for l in g["lines"] if l["group"] is grp), key=lambda l: l["x"])
        if len(ls) == 1:
            l = ls[0]
            d.append("M%s %sV%s" % (_num(l["x"]), _num(l["bottom"]), _num(l["top"])))
            continue
        a, z = ls[0], ls[-1]
        d.append("M%s %sV%sH%sV%s" % (_num(a["x"]), _num(a["bottom"]), _num(a["top"]), _num(z["x"]), _num(z["bottom"])))
        for m in ls[1:-1]:
            d.append("M%s %sV%s" % (_num(m["x"]), _num(m["bottom"]), _num(m["top"])))
    return "".join(d)


def _esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def svg(groups, width=100, height=None, stroke=None, color="currentColor", line_cap="butt",
        padding=0, order="rtl", mode="stroke", level_step=None, levels=None, title=None, class_name=None, **kw):
    """Full standalone <svg> string."""
    line_cap = kw.pop("lineCap", line_cap)
    g = layout(groups, width, height, stroke, line_cap, padding, order, level_step, levels)
    d = render(groups, width, height, stroke, line_cap, padding, order, mode, level_step, levels)
    if title is None and isinstance(groups, (int, str)):
        c = chapter(groups)
        if c:
            title = "%d %s %s" % (c["chapter"], c["kanji"], c["romaji"])
    if mode == "fill":
        attrs = 'fill="%s" fill-rule="nonzero"' % _esc(color)
    else:
        attrs = ('fill="none" stroke="%s" stroke-width="%s" stroke-linecap="%s" stroke-linejoin="%s" '
                 'stroke-miterlimit="4"' % (_esc(color), _num(g["stroke"]), _esc(g["lineCap"]),
                                            "round" if g["lineCap"] == "round" else "miter"))
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" width="%s" height="%s"%s role="img"%s>%s'
            '<path d="%s" %s/></svg>') % (
        _num(g["width"]), _num(g["height"]), _num(g["width"]), _num(g["height"]),
        (' class="%s"' % _esc(class_name)) if class_name else "",
        (' aria-label="%s"' % _esc(title)) if title else "",
        ("<title>%s</title>" % _esc(title)) if title else "", d, attrs)


def _main(argv):
    import argparse
    import os
    ap = argparse.ArgumentParser(description="Render Genji-ko symbols as SVG.")
    ap.add_argument("chapter", nargs="?", help="chapter number (2-53), kanji, kana or romaji")
    ap.add_argument("--all", metavar="OUTDIR", help="write all 52 symbols into OUTDIR")
    ap.add_argument("--groups", help='explicit partition as JSON, e.g. "[[1,3],[2,5],[4]]"')
    ap.add_argument("--width", type=float, default=100)
    ap.add_argument("--height", type=float)
    ap.add_argument("--stroke", type=float)
    ap.add_argument("--color", default="currentColor")
    ap.add_argument("--line-cap", default="butt", choices=["butt", "square", "round"])
    ap.add_argument("--mode", default="stroke", choices=["stroke", "fill"])
    ap.add_argument("--padding", type=float, default=0)
    ap.add_argument("--order", default="rtl", choices=["rtl", "ltr"])
    a = ap.parse_args(argv)
    kw = dict(width=a.width, height=a.height, stroke=a.stroke, color=a.color, line_cap=a.line_cap,
              mode=a.mode, padding=a.padding, order=a.order)
    if a.all:
        os.makedirs(a.all, exist_ok=True)
        for c in CHAPTERS:
            name = "%02d-%s.svg" % (c["chapter"], "".join(ch for ch in c["romaji"].lower() if ch.isalnum()))
            with open(os.path.join(a.all, name), "w", encoding="utf-8") as f:
                f.write(svg(c["chapter"], **kw))
        return 0
    if a.groups:
        target = json.loads(a.groups)
    elif a.chapter is not None:
        target = int(a.chapter) if a.chapter.isdigit() else a.chapter
    else:
        ap.error("give a chapter, --groups or --all")
    sys.stdout.write(svg(target, **kw) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(_main(sys.argv[1:]))
