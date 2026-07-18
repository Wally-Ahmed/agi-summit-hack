Create `ratelimit.py` in the current directory: a deterministic dual-constraint rate limiter
driven entirely by caller-supplied timestamps (no reading the real clock).

Public API: `Limiter(rate: float, capacity: float, window_limit: int)` with one method
`allow(t: float) -> bool`.

Constraint 1 — token bucket: the bucket starts FULL at `capacity` tokens and refills
continuously at `rate` tokens/second (fractional accumulation), capped at `capacity`.
An allowed request costs exactly 1 token; a request with < 1 token available is denied.

Constraint 2 — sliding window: at most `window_limit` ALLOWED requests may exist in the
half-open window `(t - 60, t]` — i.e. an earlier allowed request at time `s` still counts
iff `s > t - 60`.

A request at time `t` is allowed iff BOTH constraints permit it. A denied request consumes
no tokens and does not count toward the window. Timestamps are non-decreasing; a strictly
decreasing `t` raises ValueError. Multiple requests at the same timestamp are legal.

Standard library only. Do not modify `test.py`.
You are done when `python3 test.py` prints PASS and exits 0.
