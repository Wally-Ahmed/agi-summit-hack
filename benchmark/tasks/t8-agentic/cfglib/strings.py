def unescape(s):
    # supports \n, \t, \\ and \" escapes
    return s.replace("\\\\", "\\").replace("\\n", "\n").replace("\\t", "\t").replace('\\"', '"')
