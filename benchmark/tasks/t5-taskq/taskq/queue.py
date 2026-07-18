import heapq
from itertools import count


class TaskQueue:
    """Min-priority queue of task ids."""

    def __init__(self):
        self._heap = []
        self._counter = count()

    def push(self, task_id, priority):
        heapq.heappush(self._heap, (priority, -next(self._counter), task_id))

    def pop(self):
        if not self._heap:
            raise IndexError("pop from empty queue")
        return heapq.heappop(self._heap)[2]

    def __len__(self):
        return len(self._heap)
