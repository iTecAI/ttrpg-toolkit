import json, os
from unified_parser import Parser5e


def slug(race, suffix="_generic") -> str:
    return (
        "".join(map(lambda x: x if x.isalnum() else "_", race["name"].lower()))
        + "_"
        + "".join(map(lambda x: x if x.isalnum() else "_", race["source"].lower()))
        + "".join(map(lambda x: x if x.isalnum() else "_", suffix.lower()))
    )


def resolve_entries(race_entries: list, subrace_entries: list):
    new_entries = []
    sub_entries = subrace_entries[:]
    for k in race_entries:
        ovr = False
        for i in range(len(sub_entries) + 0):
            if (
                "data" in sub_entries[i].keys()
                and "override" in sub_entries[i]["data"].keys()
                and "name" in k.keys()
                and k["name"].lower() == sub_entries[i]["data"]["override"].lower()
            ):
                new_entries.append(sub_entries[i])
                del sub_entries[i]
                ovr = True
                break
        if not ovr:
            new_entries.append(k)

    new_entries.extend(sub_entries)
    return new_entries


def convert_subrace(race: dict, subrace: dict, parser: Parser5e):
    for k in ["name", "source", "raceName", "raceSource"]:
        if not k in subrace.keys():
            print("WARN: Skipping due to missing keys.")
            return None
    try:
        print(f"\tINF: Loading {subrace['name']}")
        data = subrace.copy()
        for k, v in race.items():
            if not k in data.keys():
                data[k] = v
        data["slug"] = slug(
            {"name": data["raceName"], "source": data["raceSource"]},
            suffix="_" + slug(subrace, suffix=""),
        )
        data["display_name"] = subrace["name"] + " " + race["name"]
        data["type"] = "subrace"
        if "entries" in race.keys() and "entries" in subrace.keys():
            data["entries"] = resolve_entries(race["entries"], subrace["entries"])
        data["fluff"] = parser.parse(
            data["entries"] if "entries" in data.keys() else []
        )
        if "entries" in data.keys():
            del data["entries"]
        if "overwrite" in subrace.keys():
            for o in subrace["overwrite"]:
                data[o] = subrace[o]
            del data["overwrite"]
        return data
    except:
        return None


def convert_one_race(race: dict, subraces: list[dict], parser: Parser5e):
    print(f"INF: Loading {race['name']}")
    results = []
    base = race.copy()
    base["slug"] = slug(race)
    base["display_name"] = race["name"]
    base["type"] = "generic"
    base["fluff"] = parser.parse(base["entries"] if "entries" in base.keys() else [])
    if "entries" in base.keys():
        del base["entries"]
    results.append(base)
    results.extend(
        [
            convert_subrace(race, i, parser)
            for i in subraces
            if i["raceName"].lower() == race["name"].lower()
            and i["raceSource"].lower() == race["source"].lower()
        ]
    )
    proc = [i for i in results if i != None]
    return {"slug": slug(race, suffix=""), "results": proc}


def load_races(data_root: str, output_folder: str) -> None:
    parser = Parser5e(data_root)
    with open(os.path.join(data_root, "races.json"), "r") as fp:
        data = json.load(fp)

    races = data["race"]
    subraces = data["subrace"]
    out = [convert_one_race(i, subraces, parser) for i in races]
    for o in out:
        with open(os.path.join(output_folder, o["slug"] + ".json"), "w") as f:
            json.dump(o["results"], f, indent=4)


if __name__ == "__main__":
    load_races("../_data/", "../data/races")
