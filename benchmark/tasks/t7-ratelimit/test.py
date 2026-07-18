from ratelimit import Limiter

# token bucket alone (window effectively unlimited)
L = Limiter(rate=1, capacity=2, window_limit=10**9)
assert L.allow(0.0), "starts full"
assert L.allow(0.0), "burst up to capacity"
assert not L.allow(0.0), "bucket empty"
assert not L.allow(0.5), "only 0.5 tokens accrued"
assert L.allow(1.0), "1 token accrued"
assert not L.allow(1.0)
assert L.allow(3.0), "refill caps at capacity"
assert L.allow(3.0)
assert not L.allow(3.0), "cap is capacity, not more"

# fractional rate
L = Limiter(rate=0.5, capacity=1, window_limit=10**9)
assert L.allow(0)
assert not L.allow(1), "0.5 tokens"
assert L.allow(2), "fractional refill must accumulate"

# sliding window alone (bucket effectively unlimited)
L = Limiter(rate=1000, capacity=1000, window_limit=2)
assert L.allow(0)
assert L.allow(10)
assert not L.allow(20), "window_limit reached"
assert not L.allow(59.999)
assert L.allow(60.0), "t=0 exits window exactly at t=60 (half-open (t-60, t])"
assert not L.allow(60.0), "t=10 and t=60 fill the window"
assert L.allow(70.0), "t=10 exits at t=70"

# denied requests must not count toward the window
L = Limiter(rate=1, capacity=1, window_limit=1)
assert L.allow(0)
assert not L.allow(0), "bucket empty"
assert not L.allow(30), "t=0 still in window"
assert L.allow(61), "window clear + bucket refilled; denials at 0/30 must not have counted"

# both constraints interact
# rate=0.1, capacity=3: tokens start 3. After two spends at t=0 -> 1 token, window {0, 0}.
L = Limiter(rate=0.1, capacity=3, window_limit=2)
assert L.allow(0) and L.allow(0)
assert not L.allow(0), "window blocks the third even though a token remains"
# t=61: window (1, 61] excludes both t=0 events; tokens = min(3, 1 + 6.1) = 3.
assert L.allow(61)
assert L.allow(61)
assert not L.allow(61), "window full again"

# time must be non-decreasing
try:
    L.allow(60)
    raise SystemExit("decreasing timestamp must raise ValueError")
except ValueError:
    pass

print("PASS")
