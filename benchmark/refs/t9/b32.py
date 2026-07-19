_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
_REV = {c: i for i, c in enumerate(_ALPHA)}

def encode(data):
    bits = "".join(format(b, "08b") for b in data)
    if len(bits) % 5:
        bits += "0" * (5 - len(bits) % 5)
    out = "".join(_ALPHA[int(bits[i:i+5], 2)] for i in range(0, len(bits), 5))
    if len(out) % 8:
        out += "=" * (8 - len(out) % 8)
    return out

def decode(text):
    if len(text) % 8:
        raise ValueError("length must be a multiple of 8")
    body = text.rstrip("=")
    pad = len(text) - len(body)
    if pad not in (0, 1, 3, 4, 6) or "=" in body:
        raise ValueError("bad padding")
    bits = ""
    for c in body:
        if c not in _REV:
            raise ValueError("bad character: %r" % c)
        bits += format(_REV[c], "05b")
    nbytes = len(bits) // 8
    return bytes(int(bits[i*8:i*8+8], 2) for i in range(nbytes))
