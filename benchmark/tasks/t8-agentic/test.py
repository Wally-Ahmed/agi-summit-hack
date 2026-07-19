import cfglib

cfg = cfglib.load('a = "x\\ny"\nb = plain\n# comment\nc = "tab\\there"\n')
assert cfg["a"] == "x\ny", repr(cfg["a"])
assert cfg["b"] == "plain"
assert cfg["c"] == "tab\there", repr(cfg["c"])

# literal backslash followed by the letter n: source escape \\n must decode to
# backslash + n, NOT newline. This is where naive sequential .replace() breaks.
cfg2 = cfglib.load('p = "c:\\\\network"\nq = "back\\\\nslash"\n')
assert cfg2["p"] == "c:\\network", repr(cfg2["p"])
assert cfg2["q"] == "back\\nslash", repr(cfg2["q"])

cfg3 = cfglib.load('m = "say \\"hi\\""\n')
assert cfg3["m"] == 'say "hi"', repr(cfg3["m"])
print("PASS")
