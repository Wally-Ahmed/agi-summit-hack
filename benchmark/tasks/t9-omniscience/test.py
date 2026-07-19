import base64, os, random, importlib.util, sys

spec = importlib.util.spec_from_file_location("b32", "b32.py")
b32 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b32)

src = open("b32.py").read()
for banned in ("base64", "binascii", "codecs"):
    assert banned not in src, "banned module referenced: " + banned

# RFC 4648 official test vectors
vectors = [b"", b"f", b"fo", b"foo", b"foob", b"fooba", b"foobar"]
for v in vectors:
    want = base64.b32encode(v).decode()
    got = b32.encode(v)
    assert got == want, (v, got, want)
    assert b32.decode(want) == v, (want,)

random.seed(7)
for _ in range(200):
    data = bytes(random.randrange(256) for _ in range(random.randrange(0, 40)))
    want = base64.b32encode(data).decode()
    assert b32.encode(data) == want
    assert b32.decode(want) == data

for bad in ["A", "ABCDEFG1", "MZXW6YQ!", "ABC=DEFG"]:
    try:
        b32.decode(bad)
    except ValueError:
        pass
    else:
        raise AssertionError("decode accepted invalid input: %r" % bad)
print("PASS")
