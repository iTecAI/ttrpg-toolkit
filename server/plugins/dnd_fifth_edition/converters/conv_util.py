import re
from typing import Any, Dict, List
from logging import exception, warning
import string

ab_map = {
    "str": "Strength",
    "dex": "Dexterity",
    "con": "Constitution",
    "int": "Intelligence",
    "wis": "Wisdom",
    "cha": "Charisma",
}


def normalize_slug(slug):
    return "".join(
        map(
            (lambda x: x if x in string.ascii_letters or x in string.digits else "_"),
            slug,
        )
    )


def parse_5etools_command(directive: str, arguments: List[str]):

    if directive == "filter":
        return arguments[0]
    if directive == "item":
        if len(arguments) < 3:
            return arguments[0]
        else:
            return arguments[2]
    if directive == "dice":
        return arguments[0].replace("×", "*")

    if directive == "i":
        return f"*{arguments[0]}*"

    if directive == "b":
        return f"**{arguments[0]}**"

    if directive == "spell":
        return f"*{arguments[0].lower()}*"

    if directive == "creature":
        return f"**{arguments[0]}**"

    if directive == "action":
        return f"**{arguments[0]}**"

    if directive == "condition":
        return f"*{arguments[0]}*"

    if directive == "sense":
        return f"*{arguments[0]}*"

    if directive == "background":
        return f"*{arguments[0].capitalize()}*"

    if directive == "skill":
        return arguments[0]

    if directive == "damage":
        return f"**{arguments[0]}**"

    if directive == "5etools":
        return arguments[0]

    if directive == "language":
        return arguments[0]

    if directive == "quickref":
        return arguments[0]

    if directive == "note":
        return f"> *{arguments[0]}*"

    if directive == "book":
        try:
            return f"**{arguments[0].capitalize()} ({arguments[1]}) - Page {arguments[2]}**"
        except:
            return f"**{arguments[0].capitalize()}**"

    if directive == "table":
        try:
            return arguments[2]
        except:
            return arguments[0]

    # print(f"Unknown command {directive} with args [{', '.join(arguments)}]")

    return arguments[0].capitalize() if len(arguments) > 0 else directive.capitalize()


def parse_5etools_string(string: str):
    try:
        segments = re.findall("\{@.*? .*?\}", string)
    except:
        print(string)
        raise TypeError

    for n in range(len(segments)):
        command = segments[n].strip("{@}")
        directive = command.split(" ", maxsplit=1)[0]
        arguments = command.split(" ", maxsplit=1)[1].split("|")
        result = parse_5etools_command(directive, arguments)
        if result:
            string = string.replace(segments[n], result, 1)

    return string


def filter_dict_array(array: list[dict], filter: Dict[str, Any]):
    for i in array:
        _all = True
        for k, v in filter.items():
            if k in i.keys():
                if not v == i[k]:
                    _all = False
            else:
                _all = False

        if _all:
            return i


def parse_5etools_table_cell(cell: str | Dict):
    if type(cell) != dict:
        return str(cell)
    if "roll" in cell.keys():
        if "exact" in cell["roll"].keys():
            return str(cell["roll"]["exact"]) + " " + cell.get("entry", "")
        if "min" in cell["roll"].keys() and "max" in cell["roll"].keys():
            return (
                "{min} - {max}".format(min=cell["roll"]["min"], max=cell["roll"]["max"])
                + " "
                + cell.get("entry", "")
            )
        print(cell)
        return ""


# === CONSTANTS ===

ABILITIES = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
]

ABILITY_MAP = {
    "str": "strength",
    "dex": "dexterity",
    "con": "constitution",
    "int": "intelligence",
    "wis": "wisdom",
    "cha": "charisma",
}

SPELLSLOT_MAP = {
    "artificer": [
        [2, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [3, 0, 0, 0, 0],
        [3, 0, 0, 0, 0],
        [4, 2, 0, 0, 0],
        [4, 2, 0, 0, 0],
        [4, 3, 0, 0, 0],
        [4, 3, 0, 0, 0],
        [4, 3, 2, 0, 0],
        [4, 3, 2, 0, 0],
        [4, 3, 3, 0, 0],
        [4, 3, 3, 0, 0],
        [4, 3, 3, 1, 0],
        [4, 3, 3, 1, 0],
        [4, 3, 3, 2, 0],
        [4, 3, 3, 2, 0],
        [4, 3, 3, 3, 1],
        [4, 3, 3, 3, 1],
        [4, 3, 3, 3, 2],
        [4, 3, 3, 3, 2],
    ],
    "pact": [
        [1, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [0, 2, 0, 0, 0],
        [0, 2, 0, 0, 0],
        [0, 0, 2, 0, 0],
        [0, 0, 2, 0, 0],
        [0, 0, 0, 2, 0],
        [0, 0, 0, 2, 0],
        [0, 0, 0, 0, 2],
        [0, 0, 0, 0, 2],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 4],
        [0, 0, 0, 0, 4],
        [0, 0, 0, 0, 4],
        [0, 0, 0, 0, 4],
    ],
    "1/3": [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [2, 0, 0, 0],
        [3, 0, 0, 0],
        [3, 0, 0, 0],
        [3, 0, 0, 0],
        [4, 2, 0, 0],
        [4, 2, 0, 0],
        [4, 2, 0, 0],
        [4, 3, 0, 0],
        [4, 3, 0, 0],
        [4, 3, 0, 0],
        [4, 3, 2, 0],
        [4, 3, 2, 0],
        [4, 3, 2, 0],
        [4, 3, 3, 0],
        [4, 3, 3, 0],
        [4, 3, 3, 0],
        [4, 3, 3, 1],
        [4, 3, 3, 1],
    ],
    "1/2": [
        [0, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [3, 0, 0, 0, 0],
        [3, 0, 0, 0, 0],
        [4, 2, 0, 0, 0],
        [4, 2, 0, 0, 0],
        [4, 3, 0, 0, 0],
        [4, 3, 0, 0, 0],
        [4, 3, 2, 0, 0],
        [4, 3, 2, 0, 0],
        [4, 3, 3, 0, 0],
        [4, 3, 3, 0, 0],
        [4, 3, 3, 1, 0],
        [4, 3, 3, 1, 0],
        [4, 3, 3, 2, 0],
        [4, 3, 3, 2, 0],
        [4, 3, 3, 3, 1],
        [4, 3, 3, 3, 1],
        [4, 3, 3, 3, 2],
        [4, 3, 3, 3, 2],
    ],
    "full": [
        [2, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 0, 0, 0, 0, 0, 0, 0, 0],
        [4, 2, 0, 0, 0, 0, 0, 0, 0],
        [4, 3, 0, 0, 0, 0, 0, 0, 0],
        [4, 3, 2, 0, 0, 0, 0, 0, 0],
        [4, 3, 3, 0, 0, 0, 0, 0, 0],
        [4, 3, 3, 1, 0, 0, 0, 0, 0],
        [4, 3, 3, 2, 0, 0, 0, 0, 0],
        [4, 3, 3, 3, 1, 0, 0, 0, 0],
        [4, 3, 3, 3, 2, 0, 0, 0, 0],
        [4, 3, 3, 3, 2, 1, 0, 0, 0],
        [4, 3, 3, 3, 2, 1, 0, 0, 0],
        [4, 3, 3, 3, 2, 1, 1, 0, 0],
        [4, 3, 3, 3, 2, 1, 1, 0, 0],
        [4, 3, 3, 3, 2, 1, 1, 1, 0],
        [4, 3, 3, 3, 2, 1, 1, 1, 0],
        [4, 3, 3, 3, 2, 1, 1, 1, 1],
        [4, 3, 3, 3, 3, 1, 1, 1, 1],
        [4, 3, 3, 3, 3, 2, 1, 1, 1],
        [4, 3, 3, 3, 3, 2, 2, 1, 1],
    ],
}
