def merge_intervals(intervals):
    """Merge overlapping or touching [start, end] intervals (inclusive ints).

    Returns a new sorted list of disjoint intervals. Touching intervals
    ([1,3] and [4,5] with integer semantics: 3+1 == 4) must merge too.
    """
    if not intervals:
        return []
    ordered = sorted(intervals, key=lambda iv: iv[1])
    merged = [list(ordered[0])]
    for start, end in ordered[1:]:
        last = merged[-1]
        if start <= last[1]:
            last[1] = end
        else:
            merged.append([start, end])
    return [tuple(iv) for iv in merged]
