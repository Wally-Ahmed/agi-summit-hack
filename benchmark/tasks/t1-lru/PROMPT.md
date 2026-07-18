Create a file named `lru.py` in the current directory implementing a class `LRUCache`:

- `LRUCache(capacity: int)` — capacity >= 1; raise ValueError otherwise.
- `get(key)` — return the value, or None if absent. A successful get marks the key most-recently-used.
- `put(key, value)` — insert/update; on overflow evict the least-recently-used entry.
- `__len__` — current number of entries.
- Do NOT use functools.lru_cache or OrderedDict; build the recency tracking yourself.

Do not modify `test.py`. You are done when `python3 test.py` prints PASS and exits 0.
