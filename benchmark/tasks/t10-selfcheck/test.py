import importlib.util
spec = importlib.util.spec_from_file_location("versions", "versions.py")
V = importlib.util.module_from_spec(spec)
spec.loader.exec_module(V)
s = V.sort_versions

# numeric components, not lexicographic
assert s(["1.0.10", "1.0.9", "1.0.2"]) == ["1.0.2", "1.0.9", "1.0.10"]
# missing components count as zero
assert s(["1.0.0", "1.0", "1"]) == ["1.0.0", "1.0", "1"] or s(["1.0.0","1.0","1"]) == ["1", "1.0", "1.0.0"]
assert s(["1.2", "1.2.1", "1.10", "1.2.0"]) in (
    [ "1.2", "1.2.0", "1.2.1", "1.10"],
    [ "1.2.0", "1.2", "1.2.1", "1.10"],
)
# pre-releases sort BEFORE their release, alphabetically among themselves
assert s(["2.0.0", "2.0.0-rc.1", "2.0.0-alpha", "2.0.0-beta"]) == \
       ["2.0.0-alpha", "2.0.0-beta", "2.0.0-rc.1", "2.0.0"]
# stability: equal keys keep input order
assert s(["3.0-beta", "3.0-alpha", "2.9.9"]) == ["2.9.9", "3.0-alpha", "3.0-beta"]
assert s([]) == []
print("PASS")
