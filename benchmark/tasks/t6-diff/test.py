import inspect, random, time
import mydiff

assert "difflib" not in inspect.getsource(mydiff), "difflib is banned"

def apply_ops(a, ops):
    out, i = [], 0
    for op in ops:
        kind = op[0]
        if kind == "=":
            n = op[1]; assert isinstance(n, int) and n >= 1
            out.extend(a[i:i + n]); i += n
        elif kind == "-":
            n = op[1]; assert isinstance(n, int) and n >= 1
            i += n
        elif kind == "+":
            lines = op[1]; assert isinstance(lines, list) and lines
            out.extend(lines)
        else:
            raise AssertionError(f"bad op kind {kind!r}")
        assert i <= len(a), "ops overrun a"
    assert i == len(a), "ops must consume all of a"
    return out

def cost(ops):
    dele = sum(op[1] for op in ops if op[0] == "-")
    ins = sum(len(op[1]) for op in ops if op[0] == "+")
    return dele + ins

def lcs_len(a, b):
    if not a or not b:
        return 0
    prev = [0] * (len(b) + 1)
    for x in a:
        cur = [0]
        ap = cur.append
        for j in range(1, len(b) + 1):
            ap(prev[j - 1] + 1 if x == b[j - 1] else max(prev[j], cur[-1]))
        prev = cur
    return prev[-1]

def check(a, b, tbound=None):
    t0 = time.time()
    ops = mydiff.diff(list(a), list(b))
    elapsed = time.time() - t0
    assert apply_ops(a, ops) == b, "ops do not reconstruct b"
    want = len(a) + len(b) - 2 * lcs_len(a, b)
    assert cost(ops) == want, f"non-minimal diff: cost {cost(ops)} != optimal {want}"
    if tbound is not None:
        assert elapsed < tbound, f"too slow: {elapsed:.1f}s"

check([], [])
check(["a"], ["a"])
check(["a"], ["b"])
check([], ["a", "b"])
check(["a", "b"], [])
check(list("abcabba"), list("cbabac"))
check(["x"] * 5, ["x"] * 3)
check(["1", "2", "3"], ["0", "1", "3", "4"])

rng = random.Random(42)
a = [f"line{i} {rng.randint(0, 9)}" for i in range(1500)]
b = list(a)
for _ in range(150):
    r = rng.random(); idx = rng.randrange(len(b))
    if r < 0.4:
        b[idx] = b[idx] + " changed"
    elif r < 0.7:
        del b[idx]
    else:
        b.insert(idx, f"new {rng.randint(0, 999)}")
check(a, b, tbound=30)
print("PASS")
