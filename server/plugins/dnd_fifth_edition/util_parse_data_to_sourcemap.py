import os, json


def parse_folder(path: str):
    smap = {}
    for p in os.listdir(path):
        if os.path.isdir(os.path.join(path, p)):
            smap[p] = parse_folder(os.path.join(path, p))
        elif p.endswith(".json"):
            smap[os.path.splitext(p)[0]] = os.path.join(path, p)

    return smap


source_map = parse_folder("data")
with open("source_map.json", "w") as s:
    s.write(json.dumps(source_map, indent=4))
