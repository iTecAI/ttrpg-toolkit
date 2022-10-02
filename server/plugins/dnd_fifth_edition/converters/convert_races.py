import json, os
from conv_util import (
    parse_5etools_command,
    parse_5etools_string,
    parse_5etools_table_cell,
)


def slug(race, suffix="_generic") -> str:
    return (
        "".join(map(lambda x: x if x.isalnum() else "_", race["name"].lower()))
        + "_"
        + "".join(map(lambda x: x if x.isalnum() else "_", race["source"].lower()))
        + "".join(map(lambda x: x if x.isalnum() else "_", suffix.lower()))
    )


def convert_subrace(subrace):
    try:
        print(f"\tINF: Loading {subrace['name']}")
        data = subrace.copy()
        data["slug"] = slug(
            {"name": data["raceName"], "source": data["raceSource"]},
            suffix="_" + slug(subrace, suffix=""),
        )
        data["type"] = "subrace"
        return data
    except:
        return None


def convert_one_race(race: dict, subraces: list[dict]):
    print(f"INF: Loading {race['name']}")
    results = []
    base = race.copy()
    base["slug"] = slug(race)
    base["type"] = "generic"
    results.append(base)
    results.extend(
        [
            convert_subrace(i)
            for i in subraces
            if i["raceName"].lower() == race["name"].lower()
            and i["raceSource"].lower() == race["source"].lower()
        ]
    )
    proc = [i for i in results if i != None]
    return {"slug": slug(race, suffix=""), "results": proc}


def load_races(data_root: str, output_folder: str) -> None:
    with open(data_root, "r") as fp:
        data = json.load(fp)

    races = data["race"]
    subraces = data["subrace"]
    out = [convert_one_race(i, subraces) for i in races]
    for o in out:
        with open(os.path.join(output_folder, o["slug"] + ".json"), "w") as f:
            json.dump(o["results"], f, indent=4)


if __name__ == "__main__":
    load_races("../_data/races.json", "../data/races")
