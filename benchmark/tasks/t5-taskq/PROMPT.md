The package `taskq/` (queue.py, retry.py, api.py) has several bugs, and one feature is missing.
`python3 test.py` currently fails. Make it pass.

Spec:
- `taskq.queue.TaskQueue`: min-priority queue of task ids. `push(task_id, priority)`,
  `pop()` returns the lowest-priority id — **equal priorities must come out FIFO** (insertion
  order). `pop()` on an empty queue raises IndexError. `__len__`.
- `taskq.retry.backoff_schedule(retries, base=2, cap=60)`: list of delays, one per retry —
  `[base**1, base**2, …]` each capped at `cap`, length exactly `retries`.
- `taskq.api.Task`: `.id`, `.priority`, `.tags` (list), `.add_tag(tag)`. Tags must be
  **per-task** — never shared between instances.
- `taskq.api.Client`: `submit(task_id, priority=0) -> Task`, `next_task() -> Task` (delivers by
  priority, FIFO on ties; IndexError when nothing deliverable), `__len__` = number of tasks that
  are submitted, not yet delivered, and not cancelled.
- **NEW — implement:** `Client.cancel(task_id)`. A cancelled task is never delivered by
  `next_task` and does not count in `len`. Cancelling anything not currently pending (unknown
  id, already delivered, or already cancelled) raises KeyError.

Do not modify `test.py`. Internal refactors are allowed; keep the public names above.
You are done when `python3 test.py` prints PASS and exits 0.
