import json
import fileinput
import re
from collections import defaultdict

# Look for JSONP wrapped JSON - JSON wrapped in a JavaScript function call
# like:
#    my_callback1 ( [ 1, 2, 3, 4 ] ) ;
#
# This doesn't really respect every possible function name, but it'll catch most
# common ones.
def strip_jsonp(raw):
    start = re.match(r"^( *[$a-z0-9A-Z_]+ *[(] *)[[{]", raw[0:50])
    end = re.search(r"[]}] *([)][ ;]*)$", raw[-10:])

    if start and end:
        raw = raw[len(start.group(1)) : -1 * len(end.group(1))]

    return raw


raw = "\n".join(fileinput.input())
raw = strip_jsonp(raw)

data = json.loads(raw)


def yieldkeys(data, parent_key=None):
    parent_key = "%s." % (parent_key) if parent_key else ""

    if isinstance(data, list):
        for i, item in enumerate(data):
            for y in yieldkeys(item, "%s[]" % (parent_key)):
                yield (y)
    elif isinstance(data, dict):
        for i, item in data.items():
            for y in yieldkeys(item, "%s{%s}" % (parent_key, i)):
                yield (y)
    else:
        yield ("%s%s" % (parent_key, type(data).__name__))


keycount = defaultdict(lambda: 0)
for a in yieldkeys(data):
    keycount[a] += 1

for key in sorted(keycount.keys()):
    print("%4d %s" % (keycount[key], key))
