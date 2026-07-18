from .queue import TaskQueue


class Task:
    def __init__(self, task_id, priority=0, tags=[]):
        self.id = task_id
        self.priority = priority
        self.tags = tags

    def add_tag(self, tag):
        self.tags.append(tag)


class Client:
    def __init__(self):
        self._q = TaskQueue()
        self._tasks = {}

    def submit(self, task_id, priority=0):
        task = Task(task_id, priority)
        self._tasks[task_id] = task
        self._q.push(task_id, priority)
        return task

    def next_task(self):
        return self._tasks[self._q.pop()]

    def __len__(self):
        return len(self._q)
