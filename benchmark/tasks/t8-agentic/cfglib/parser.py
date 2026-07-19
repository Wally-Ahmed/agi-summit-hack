from .strings import unescape

def parse_line(line):
    if "=" not in line:
        raise ValueError("bad line: %r" % line)
    k, _, v = line.partition("=")
    k = k.strip()
    v = v.strip()
    if v.startswith('"') and v.endswith('"') and len(v) >= 2:
        v = unescape(v[1:-1])
    return k, v
