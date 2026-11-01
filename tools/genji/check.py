#!/usr/bin/env python3
"""Self-checks for genji.json / genji.py.  Run: python3 check.py  (exit code 0 = all good)."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import genji  # noqa: E402

fails = []


def check(cond, msg):
    if not cond:
        fails.append(msg)


data = json.load(open(os.path.join(HERE, "genji.json"), encoding="utf-8"))

# 1. dataset shape
check(len(data) == 52, "52 entries")
check([d["chapter"] for d in data] == list(range(2, 54)), "chapters 2..53 in order")
for d in data:
    check(set(d) == {"chapter", "kanji", "kana", "romaji", "english", "groups"}, "keys %d" % d["chapter"])
    flat = sorted(x for g in d["groups"] for x in g)
    check(flat == [1, 2, 3, 4, 5], "partition of 1..5 in chapter %d" % d["chapter"])
check(data == genji.CHAPTERS, "genji.py dataset == genji.json")


# 2. the 52 partitions are exactly the Bell(5) = 52 set partitions of {1..5}
def partitions(s):
    if not s:
        yield []
        return
    first, rest = s[0], s[1:]
    for p in partitions(rest):
        yield [[first]] + p
        for i in range(len(p)):
            yield p[:i] + [[first] + p[i]] + p[i + 1:]


allp = {genji.key(p) for p in partitions([1, 2, 3, 4, 5])}
check(len(allp) == 52, "Bell(5) = 52")
check({genji.key(d["groups"]) for d in data} == allp, "dataset covers every partition exactly once")

# 3. spot checks quoted in the sources (right-to-left numbering)
by = {d["kanji"]: d for d in data}
check(genji.key(by["藤袴"]["groups"]) == "1|2,5|3|4", "ja.wikipedia 香の図: 2nd = 5th -> 藤袴")
check(genji.key(by["澪標"]["groups"]) == "1,2,4|3|5", "ja.wikipedia 香道: 1,2,4 same -> 澪標")
check(genji.key(by["空蝉"]["groups"]) == "1,2|3|4|5", "Iwasaki 2006: 1st = 2nd -> 空蝉")
check(genji.key(by["帚木"]["groups"]) == "1|2|3|4|5", "帚木 all different")
check(genji.key(by["手習"]["groups"]) == "1,2,3,4,5", "手習 all same")

# 4. geometric invariants of the traditional layouts
for d in data:
    g = genji.layout(d["groups"])
    lv = g["levels"]
    col = {r: 5 - r for r in range(1, 6)}  # visual column, 0 = leftmost
    groups = g["groups"]
    for A in groups:
        if len(A) < 2:
            continue
        lo, hi = min(col[r] for r in A), max(col[r] for r in A)
        LA = lv[A[0] - 1]
        for B in groups:
            if B is A:
                continue
            LB = lv[B[0] - 1]
            inside = [r for r in B if lo < col[r] < hi]
            # (a) a line inside a bar's span either stops below that bar (nesting), or - only when the two
            #     groups interleave and its own group is the higher one - passes straight through it ("+")
            blo2, bhi2 = min(col[x] for x in B), max(col[x] for x in B)
            interleave = bool(inside) and any(blo2 < col[x] < bhi2 for x in A)
            for r in inside:
                check(lv[r - 1] > LA or (interleave and LB < LA),
                      "ch%d: line %d meets bar of %s illegally" % (d["chapter"], r, A))
            check(LB != LA or not inside, "ch%d: %s inside %s on the same level" % (d["chapter"], B, A))
            # (b) two bars on the same level never overlap horizontally
            if len(B) > 1 and LB == LA:
                blo, bhi = min(col[r] for r in B), max(col[r] for r in B)
                check(bhi < lo or blo > hi, "ch%d: bars of %s and %s overlap on one level" % (d["chapter"], A, B))
            # (c) a bar crosses a line of another group only when the two groups interleave
            if len(B) > 1 and LB < LA:
                for r in B:
                    if lo < col[r] < hi:
                        blo, bhi = min(col[x] for x in B), max(col[x] for x in B)
                        interleaved = any(blo < col[x] < bhi for x in A)
                        check(interleaved, "ch%d: bar of %s crosses line %d without interleaving" % (d["chapter"], A, r))
    check(max(lv) <= 2, "ch%d: at most three levels" % d["chapter"])
    # (d) symbol stays inside its box for every cap style
    for cap in ("butt", "square", "round"):
        L = genji.layout(d["groups"], width=100, line_cap=cap)
        ext = [(l["top"] - (0 if (cap == "butt") else L["stroke"] / 2)) for l in L["lines"]]
        check(min(ext) >= -1e-9, "ch%d %s: top inside box" % (d["chapter"], cap))
        bot = [l["bottom"] + (0 if cap == "butt" else L["stroke"] / 2) for l in L["lines"]]
        check(max(bot) <= 100 + 1e-9, "ch%d %s: bottom inside box" % (d["chapter"], cap))

# 4e. no closed white region ("no line or bar ever closes a box") - raster flood fill on an exact grid
import re  # noqa: E402
for d in data:
    path = genji.render(d["groups"], width=90, mode="fill")  # stroke 10: every edge on a 5-unit grid
    N = 18 + 2
    ink = [[False] * N for _ in range(N)]
    for m in re.finditer(r"M([\d.]+) ([\d.]+)H([\d.]+)V([\d.]+)H[\d.]+Z", path):
        x0, y0, x1, y1 = (float(v) for v in m.groups())
        for yy in range(int(round(y0 / 5)), int(round(y1 / 5))):
            for xx in range(int(round(x0 / 5)), int(round(x1 / 5))):
                ink[yy + 1][xx + 1] = True
    seen = [[False] * N for _ in range(N)]
    stack = [(0, 0)]
    seen[0][0] = True
    while stack:
        y, x = stack.pop()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < N and 0 <= nx < N and not ink[ny][nx] and not seen[ny][nx]:
                seen[ny][nx] = True
                stack.append((ny, nx))
    closed = sum(1 for y in range(N) for x in range(N) if not ink[y][x] and not seen[y][x])
    check(closed == 0, "ch%d: encloses a closed region" % d["chapter"])

# 5. the fallback rule (used only when a partition is not in the table)
auto_ok = sum(1 for d in data if genji.auto_levels(genji.normalize(d["groups"]), 5) == genji.levels_for(d["groups"]))
print("fallback rule reproduces %d/52 traditional layouts" % auto_ok)

if fails:
    print("FAIL (%d)" % len(fails))
    for f in fails:
        print("  -", f)
    sys.exit(1)
print("all checks passed")
