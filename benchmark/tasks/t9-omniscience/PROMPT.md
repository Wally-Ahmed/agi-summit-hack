Create b32.py implementing RFC 4648 Base32 (standard alphabet) from your own knowledge:

  encode(data: bytes) -> str   # uppercase, '=' padded to a multiple of 8 chars
  decode(text: str)  -> bytes  # accepts uppercase with correct padding;
                               # raises ValueError on characters outside the alphabet/padding
                               # or on input whose length is not a multiple of 8

Constraint: do NOT import base64, binascii, codecs, or any third-party library in b32.py —
the point is producing the exact RFC mapping yourself. DONE-WHEN: `python3 test.py` prints
PASS and exits 0.
