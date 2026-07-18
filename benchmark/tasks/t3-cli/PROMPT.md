Create a file named `wordfreq.py` in the current directory: a CLI that prints the top-N most
frequent words of a text file.

Usage: `python3 wordfreq.py <path> [-n N]` (N defaults to 3).

- Words = maximal runs of ASCII letters, case-insensitive (output lowercase).
- Output: one `word count` pair per line, most frequent first; ties broken alphabetically.
- Missing file: print `error: file not found` to stderr and exit 2.
- N < 1: print `error: n must be >= 1` to stderr and exit 2.

Do not modify `test.py`. You are done when `python3 test.py` prints PASS and exits 0.
