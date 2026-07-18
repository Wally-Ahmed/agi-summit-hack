def backoff_schedule(retries, base=2, cap=60):
    """Delay before each retry attempt, exponentially increasing and capped."""
    return [min(base ** i, cap) for i in range(1, retries)]
