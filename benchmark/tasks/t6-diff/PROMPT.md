Create `mydiff.py` in the current directory: a minimal line-diff engine.

Public API: `diff(a: list[str], b: list[str]) -> list` returning an ops list that transforms
`a` into `b` when applied left-to-right:

- `("=", n)` — copy the next `n` lines of `a` (n >= 1)
- `("-", n)` — delete the next `n` lines of `a` (n >= 1)
- `("+", lines)` — insert `lines` (a non-empty list of strings)

Requirements:
1. Applying the ops to `a` must reproduce `b` exactly, consuming all of `a`.
2. The diff must be MINIMAL: total edit cost (deleted lines + inserted lines) must equal
   `len(a) + len(b) - 2 * LCS(a, b)`.
3. Performance: inputs up to ~1500 lines each with ~10% edits must complete in well under
   30 seconds in pure CPython. (Quadratic DP is fine if implemented tightly; exponential
   recursion is not.)
4. Standard library only; no subprocess/difflib. Write the algorithm yourself.

Do not modify `test.py`. You are done when `python3 test.py` prints PASS and exits 0.
