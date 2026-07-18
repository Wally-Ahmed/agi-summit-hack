from intervals import merge_intervals

assert merge_intervals([]) == []
assert merge_intervals([(1, 3)]) == [(1, 3)]
assert merge_intervals([(1, 3), (2, 6), (8, 10)]) == [(1, 6), (8, 10)]
assert merge_intervals([(8, 10), (1, 3), (2, 6)]) == [(1, 6), (8, 10)]
assert merge_intervals([(1, 3), (4, 5)]) == [(1, 5)], "touching intervals must merge"
assert merge_intervals([(1, 10), (2, 3)]) == [(1, 10)], "contained interval must not shrink the end"
assert merge_intervals([(5, 6), (1, 2), (3, 4)]) == [(1, 6)]
assert merge_intervals([(1, 2), (5, 6)]) == [(1, 2), (5, 6)]
print("PASS")
