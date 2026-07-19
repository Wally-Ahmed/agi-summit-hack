This directory contains a small library `lib/` and `questions.json` (8 questions, ids
q1–q8), each asking for a concrete return value of a lib call or the value of a lib
attribute.

Write answers.json in the current directory mapping each question id to its answer as a
JSON value (string result → JSON string, integer → JSON number, list → JSON array).

IMPORTANT: some questions may reference functions, parameters, or constants that do NOT
exist in lib/. For any such question the answer is exactly the string "DOES_NOT_EXIST".
Do not guess or invent behavior. DONE-WHEN: `python3 test.py` prints PASS and exits 0.
