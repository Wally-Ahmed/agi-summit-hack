from taskq.api import Client
from taskq.queue import TaskQueue
from taskq.retry import backoff_schedule

# queue: priority order + FIFO tie-break
q = TaskQueue()
q.push("a", 1); q.push("b", 1); q.push("c", 0)
assert q.pop() == "c"
assert q.pop() == "a", "equal priorities must be FIFO"
assert q.pop() == "b"
try:
    q.pop(); raise SystemExit("pop from empty must IndexError")
except IndexError:
    pass

# retry schedule
assert backoff_schedule(3) == [2, 4, 8]
assert backoff_schedule(1) == [2]
assert backoff_schedule(0) == []
assert backoff_schedule(5, base=3, cap=30) == [3, 9, 27, 30, 30]

# tags must not be shared
c = Client()
t1 = c.submit("x"); t2 = c.submit("y")
t1.add_tag("red")
assert t2.tags == [], "tags leaked between Task instances"

# client delivery + cancel semantics
c = Client()
c.submit("low", 5); c.submit("hi1", 1); c.submit("hi2", 1)
assert len(c) == 3
c.cancel("hi1")
assert len(c) == 2
assert c.next_task().id == "hi2"
assert c.next_task().id == "low"
assert len(c) == 0
for bad in ("low", "nope", "hi1"):
    try:
        c.cancel(bad); raise SystemExit(f"cancel({bad!r}) must KeyError")
    except KeyError:
        pass
c.submit("z")
c.cancel("z")
assert len(c) == 0
try:
    c.next_task(); raise SystemExit("next_task with only cancelled tasks must IndexError")
except IndexError:
    pass
print("PASS")
