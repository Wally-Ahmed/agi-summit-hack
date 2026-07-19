Read the scheduling constraints below and write schedule.json in the current directory
assigning every task to exactly one machine:

  {"A": ["…"], "B": ["…"], "C": ["…"]}

Machines: A, B, C. Task durations: t1=3 t2=2 t3=4 t4=1 t5=2.
Constraints (all must hold):
  1. Each machine's total assigned duration is at most 6.
  2. Machine C's total is at most 5.
  3. t1 and t3 are on different machines.
  4. t2 and t4 are on the same machine.
  5. t5 is not on machine A.

Any assignment satisfying every constraint passes. DONE-WHEN: `python3 test.py` prints
PASS and exits 0.
