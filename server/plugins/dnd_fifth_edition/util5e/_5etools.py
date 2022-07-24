import re
from typing import Any, Dict, List
from logging import exception, warning

ab_map = {
    "str": "Strength",
    "dex": "Dexterity",
    "con": "Constitution",
    "int": "Intelligence",
    "wis": "Wisdom",
    "cha": "Charisma",
}


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

    return None


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
    # print(cell)
    if "roll" in cell.keys():
        return str(cell["roll"]["exact"])


def parse_5etools_entries(
    entries: List[dict | str],
    class_features: list,
    subclass_features: list,
    optional_features: list,
) -> List[str]:
    lines = []
    for line in entries:
        try:
            if type(line) == str:
                lines.append(parse_5etools_string(line))
            else:
                if line["type"] == "entries":
                    if "name" in line.keys():
                        lines.append("")
                        lines.append(f"## {line['name']}")
                        lines.extend(
                            parse_5etools_entries(
                                line["entries"],
                                class_features,
                                subclass_features,
                                optional_features,
                            )
                        )
                    else:
                        lines.append("")
                        lines.extend(
                            parse_5etools_entries(
                                line["entries"],
                                class_features,
                                subclass_features,
                                optional_features,
                            )
                        )
                elif line["type"] == "section":
                    lines.append("")
                    if "name" in line.keys():
                        lines.append(f"# {line['name']}")
                    if "source" in line.keys() and "page" in line.keys():
                        lines.append(f"*{line['source']} - {line['page']}*")
                    lines.extend(
                        parse_5etools_entries(
                            line["entries"],
                            class_features,
                            subclass_features,
                            optional_features,
                        )
                    )
                elif line["type"] == "refClassFeature":
                    parts = line["classFeature"].split("|")
                    lines.append("")
                    lines.append(f"## {parts[0]}")

                    feat = filter_dict_array(
                        class_features, {"name": parts[0], "className": parts[1]}
                    )

                    if feat:
                        lines.extend(
                            parse_5etools_entries(
                                feat["entries"],
                                class_features,
                                subclass_features,
                                optional_features,
                            )
                        )
                    else:
                        lines.append("*No Data*")
                elif line["type"] == "refSubclassFeature":
                    parts = line["subclassFeature"].split("|")
                    lines.append("")
                    lines.append(f"## {parts[0]}")

                    feat = filter_dict_array(
                        subclass_features,
                        {
                            "name": parts[0],
                            "className": parts[1],
                            "subclassShortName": parts[3],
                        },
                    )

                    if feat:
                        lines.extend(
                            parse_5etools_entries(
                                feat["entries"],
                                class_features,
                                subclass_features,
                                optional_features,
                            )
                        )
                    else:
                        lines.append("*No Data*")
                elif line["type"] == "table":
                    lines.append("")
                    lines.append(
                        f"### {line['caption'] if 'caption' in line.keys() else 'Table'}"
                    )
                    lines.append(
                        "| {headers} |".format(headers=" | ".join(line["colLabels"]))
                    )

                    style_items = []
                    for s in line["colStyles"]:
                        parts = s.split(" ")
                        if "text-center" in parts:
                            style_items.append(":---:")
                        elif "text-right" in parts:
                            style_items.append("----:")
                        else:
                            style_items.append(":----")

                    lines.append(f"| {' | '.join(style_items)} |")

                    lines.extend(
                        [
                            "| "
                            + " | ".join([parse_5etools_table_cell(c) for c in r])
                            + " |"
                            for r in line["rows"]
                        ]
                    )
                    lines.append("")
                    if "footnotes" in line.keys():
                        lines.extend(line["footnotes"])

                elif line["type"] == "list":
                    lines.append("")
                    for li in line["items"]:
                        if type(li) == "str":
                            lines.append("- " + li)
                        else:
                            if type(li) == dict and "type" in li.keys():
                                if "entries" in li.keys():
                                    lines.append(
                                        (
                                            ("**" + li["name"] + "** ")
                                            if "name" in li.keys()
                                            else ""
                                        )
                                        + " ".join(
                                            parse_5etools_entries(
                                                li["entries"],
                                                class_features,
                                                subclass_features,
                                                optional_features,
                                            )
                                        )
                                    )
                                elif "entry" in li.keys():
                                    lines.append(
                                        (
                                            ("**" + li["name"] + "** ")
                                            if "name" in li.keys()
                                            else ""
                                        )
                                        + li["entry"]
                                    )
                                else:
                                    lines.extend(
                                        parse_5etools_entries(
                                            [li],
                                            class_features,
                                            subclass_features,
                                            optional_features,
                                        )
                                    )
                            else:
                                lines.append(str(li))

                elif line["type"] == "abilityDc":
                    lines.append(
                        "**{name} Save DC:** 8 + your proficiency bonus + {attrs}".format(
                            name=line["name"],
                            attrs=" + ".join([ab_map[a] for a in line["attributes"]]),
                        )
                    )

                elif line["type"] == "options":
                    lines.append("")
                    if "count" in line.keys():
                        lines.append(f"Select any {line['count']} of the following:")
                    else:
                        pass
                    lines.extend(
                        parse_5etools_entries(
                            line["entries"],
                            class_features,
                            subclass_features,
                            optional_features,
                        )
                    )

                elif line["type"] == "inset":
                    lines.append("")
                    lines.append("> **{title}**".format(title=line["name"]))
                    lines.append(">")
                    lines.extend(
                        [
                            "> " + e
                            for e in parse_5etools_entries(
                                line["entries"],
                                class_features,
                                subclass_features,
                                optional_features,
                            )
                        ]
                    )
                    lines.append("")

                elif line["type"] == "quote":
                    lines.append("")
                    lines.extend(
                        [
                            "> " + e
                            for e in parse_5etools_entries(
                                line["entries"],
                                class_features,
                                subclass_features,
                                optional_features,
                            )
                        ]
                    )
                    lines.append("")

                elif line["type"] == "refOptionalfeature":
                    result = filter_dict_array(
                        optional_features["optionalfeature"],
                        {"name": line["optionalfeature"]},
                    )
                    lines.append("")
                    if result:
                        lines.append(f"**{result['name']} ({result['source']}):**")
                        lines.extend(
                            parse_5etools_entries(
                                result["entries"],
                                class_features,
                                subclass_features,
                                optional_features,
                            )
                        )
                elif line["type"] == "abilityAttackMod":
                    lines.append(
                        f"**{line['name']}:** {[ab_map[a] for a in line['attributes']]}"
                    )
                else:
                    # warning(f"Unknown entry type {line['type']} on entry {line}")
                    lines.append(str(line))
        except:
            exception(f"Error parsing {line}:")

    return [parse_5etools_string(l) for l in lines]
