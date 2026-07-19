import json
import sys

DUR = {"t1": 3, "t2": 2, "t3": 4, "t4": 1, "t5": 2}


def fail(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


try:
    with open("schedule.json") as f:
        sched = json.load(f)
except Exception as e:
    fail(f"cannot read schedule.json: {e}")

if not isinstance(sched, dict) or set(sched) != {"A", "B", "C"}:
    fail('schedule.json must be an object with exactly the keys "A", "B", "C"')

where = {}
for m in ("A", "B", "C"):
    if not isinstance(sched[m], list):
        fail(f"machine {m} must map to a list")
    for t in sched[m]:
        if t not in DUR:
            fail(f"unknown task {t!r}")
        if t in where:
            fail(f"task {t} assigned to both {where[t]} and {m}")
        where[t] = m

missing = sorted(set(DUR) - set(where))
if missing:
    fail(f"unassigned tasks: {missing}")

load = {m: sum(DUR[t] for t in sched[m]) for m in ("A", "B", "C")}
for m in ("A", "B", "C"):
    if load[m] > 6:
        fail(f"machine {m} total {load[m]} exceeds 6")
if load["C"] > 5:
    fail(f"machine C total {load['C']} exceeds 5")
if where["t1"] == where["t3"]:
    fail("t1 and t3 are on the same machine")
if where["t2"] != where["t4"]:
    fail("t2 and t4 are on different machines")
if where["t5"] == "A":
    fail("t5 is on machine A")

print(f"loads: {load}")
print("PASS")
