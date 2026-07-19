from .parser import parse_line

def load(text):
    out = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        k, v = parse_line(line)
        out[k] = v
    return out
