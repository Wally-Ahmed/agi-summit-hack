"""Small string/collection utility library."""


def slugify(s):
    """Lowercase the string and replace spaces with hyphens."""
    return s.lower().replace(" ", "-")


def parse_id(s):
    """Return the integer in s after stripping leading non-digit characters."""
    i = 0
    while i < len(s) and not s[i].isdigit():
        i += 1
    return int(s[i:])


def clamp(n, lo, hi):
    """Clamp n into the inclusive range [lo, hi]."""
    return max(lo, min(hi, n))


def merge_tags(a, b):
    """Merge two tag lists, deduplicated, preserving first-seen order."""
    out = []
    for t in list(a) + list(b):
        if t not in out:
            out.append(t)
    return out
