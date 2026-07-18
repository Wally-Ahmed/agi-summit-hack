import subprocess, sys, tempfile, os

def run(*args):
    return subprocess.run([sys.executable, "wordfreq.py", *args],
                          capture_output=True, text=True)

with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
    f.write("The cat saw the dog. The dog-cat saw2 CAT!\nbee bee apple apple")
    path = f.name

try:
    r = run(path, "-n", "2")
    assert r.returncode == 0, r.stderr
    assert r.stdout.splitlines() == ["cat 3", "the 3"], repr(r.stdout)

    r = run(path)
    assert r.returncode == 0
    assert r.stdout.splitlines() == ["cat 3", "the 3", "apple 2"], repr(r.stdout)

    r = run("/nonexistent/file.txt")
    assert r.returncode == 2 and "error: file not found" in r.stderr

    r = run(path, "-n", "0")
    assert r.returncode == 2 and "error: n must be >= 1" in r.stderr
finally:
    os.unlink(path)
print("PASS")
