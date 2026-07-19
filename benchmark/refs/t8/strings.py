def unescape(s):
    out = []
    i = 0
    while i < len(s):
        ch = s[i]
        if ch == "\\" and i + 1 < len(s):
            nxt = s[i+1]
            mapped = {"n": "\n", "t": "\t", "\\": "\\", '"': '"'}.get(nxt)
            if mapped is not None:
                out.append(mapped)
                i += 2
                continue
        out.append(ch)
        i += 1
    return "".join(out)
