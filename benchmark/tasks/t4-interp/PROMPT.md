Create `calc.py` in the current directory: an interpreter for a tiny integer expression language.

Public API: `evaluate(program: str) -> int`.

A program is zero or more `let` statements followed by exactly one final expression, separated by
semicolons. Whitespace (including newlines) is insignificant everywhere except inside tokens.

    let x = 3; let y = x * 4; y + 2        =>  14

Grammar / semantics:
- Integer literals (decimal, non-negative in source; negatives come from unary minus).
- Variables: `[a-zA-Z_][a-zA-Z0-9_]*` (excluding keyword `let`). `let NAME = expr;` binds; later
  `let` may shadow an earlier binding. Referencing an unbound name raises `NameError`.
- Binary operators: `+ - * / % **`. `/` and `%` are Python-style floor division/modulo
  (`-7 / 2 == -4`, `-7 % 2 == 1`). Division or modulo by zero raises `ZeroDivisionError`.
- `**` is exponentiation, RIGHT-associative: `2 ** 3 ** 2 == 512`. Negative exponent raises
  `ValueError`.
- Unary minus, repeatable: `--3 == 3`.
- Precedence, tightest first: `**`, then unary minus, then `* / %`, then `+ -`.
  Consequence: `-2 ** 2 == -4` (unary minus binds looser than `**`), and `(-2) ** 2 == 4`.
- Parentheses group.
- Malformed programs (bad tokens, trailing operators, missing final expression, unbalanced
  parens, `let` without `=`, etc.) raise `SyntaxError`.

No eval/exec/ast/compile anywhere in your code. Write the tokenizer and parser yourself.
Do not modify `test.py`. You are done when `python3 test.py` prints PASS and exits 0.
