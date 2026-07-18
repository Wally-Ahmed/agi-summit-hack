import inspect
import calc

src = inspect.getsource(calc)
for banned in ("eval", "exec", "compile", "import ast"):
    assert banned not in src.replace("evaluate", ""), f"banned construct: {banned}"

E = calc.evaluate

# basics + precedence
assert E("1 + 2 * 3") == 7
assert E("(1 + 2) * 3") == 9
assert E("2 ** 3 ** 2") == 512, "** must be right-associative"
assert E("-2 ** 2") == -4, "unary minus binds looser than **"
assert E("(-2) ** 2") == 4
assert E("--3") == 3
assert E("-7 / 2") == -4, "floor division"
assert E("-7 % 2") == 1, "python-style modulo"
assert E("10 - 3 - 4") == 3, "left associativity"
assert E("100 / 10 / 5") == 2
assert E("7 % 4 * 2") == 6
assert E("2 * 3 ** 2") == 18

# let bindings
assert E("let x = 3; x") == 3
assert E("let x = 3; let y = x * 4; y + 2") == 14
assert E("let x = 2; let x = x ** 3; x") == 8, "shadowing uses previous binding"
assert E("let _a1 = 5; _a1 % 3") == 2
assert E("  let x = 1 ;\n x + 1 ") == 2, "whitespace/newlines insignificant"

def raises(exc, prog):
    try:
        E(prog)
    except exc:
        return True
    except Exception as e:
        raise AssertionError(f"{prog!r} raised {type(e).__name__}, wanted {exc.__name__}")
    raise AssertionError(f"{prog!r} did not raise {exc.__name__}")

assert raises(NameError, "x")
assert raises(NameError, "let x = y; x")
assert raises(ZeroDivisionError, "1 / 0")
assert raises(ZeroDivisionError, "let x = 0; 5 % x")
assert raises(ValueError, "2 ** -1")
assert raises(SyntaxError, "1 +")
assert raises(SyntaxError, "let x 3; x")
assert raises(SyntaxError, "(1 + 2")
assert raises(SyntaxError, "1 2")
assert raises(SyntaxError, "let x = 3;")
assert raises(SyntaxError, "let let = 3; 1")
assert raises(SyntaxError, "")

print("PASS")
