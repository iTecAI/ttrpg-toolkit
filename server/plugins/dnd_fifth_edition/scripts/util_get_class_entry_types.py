import json, os

types = {}
ROOT = "../data/class/"


def parse_class(data):
    global types

    for feat in data["classFeature"]:
        for e in feat["entries"]:
            if type(e) == dict:
                if not e["type"] in types.keys():
                    types[e["type"]] = {"keys": [], "occurrences": []}
                for k in e.keys():
                    if not k in types[e["type"]]["keys"]:
                        types[e["type"]]["keys"].append(k)

                types[e["type"]]["occurrences"].append(
                    f'class:{feat["name"]}:{feat["source"]}:{feat["className"]}:{feat["classSource"]}'
                )

    if "subclassFeature" in data.keys():
        for feat in data["subclassFeature"]:
            for e in feat["entries"]:
                if type(e) == dict:
                    if not e["type"] in types.keys():
                        types[e["type"]] = {"keys": [], "occurrences": []}
                    for k in e.keys():
                        if not k in types[e["type"]]["keys"]:
                            types[e["type"]]["keys"].append(k)

                    types[e["type"]]["occurrences"].append(
                        f'subclass:{feat["name"]}:{feat["source"]}:{feat["className"]}:{feat["classSource"]}'
                    )


for f in os.listdir(ROOT):
    if f.startswith("class-") and not "generic" in f:
        with open(ROOT + f, "r") as file:
            data = json.load(file)

        print(f)
        parse_class(data)

with open("entry_types.json", "w") as f:
    json.dump(types, f, indent=4)
