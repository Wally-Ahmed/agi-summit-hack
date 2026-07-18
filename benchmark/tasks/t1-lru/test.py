import sys, inspect
import lru

src = inspect.getsource(lru)
assert "OrderedDict" not in src and "lru_cache" not in src, "forbidden helper used"

c = lru.LRUCache(2)
try:
    lru.LRUCache(0)
    sys.exit("capacity 0 should raise")
except ValueError:
    pass
c.put("a", 1); c.put("b", 2)
assert c.get("a") == 1
c.put("c", 3)                      # evicts b (a was refreshed by get)
assert c.get("b") is None
assert c.get("a") == 1 and c.get("c") == 3
c.put("a", 99)                     # update, no eviction
assert c.get("a") == 99 and len(c) == 2
c.put("d", 4)                      # evicts c (a refreshed by get above)
assert c.get("c") is None and c.get("d") == 4
assert c.get("nope") is None
print("PASS")
