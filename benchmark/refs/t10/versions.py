def _key(v):
    core, sep, pre = v.partition("-")
    nums = [int(x) for x in core.split(".") if x != ""]
    nums += [0] * (3 - len(nums))
    return (nums, 0 if sep else 1, pre)

def sort_versions(versions):
    return sorted(versions, key=_key)
