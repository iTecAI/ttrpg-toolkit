from typing import Any, Dict
import json
import string
import os
from conv_util import *

EXCLUDE = ["foundry.json", "index.json"]


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
                    lines.append("")
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


def load_skills(skill_list):
    return [
        {
            "mode": "choose" if "choose" in data.keys() else "any",
            "count": data["choose"]["count"]
            if "choose" in data.keys()
            else data["any"],
            "choose_from": data["choose"]["from"] if "choose" in data.keys() else [],
        }
        for data in skill_list
    ]


def load_starting_equipment(data):
    return {
        "backgroundItems": data["additionalFromBackground"]
        if "additionalFromBackground"
        else [],
        "gold": parse_5etools_string(data["goldAlternative"])
        if "goldAlternative" in data.keys()
        else None,
        "items": [parse_5etools_string(i) for i in data["default"]],
    }


def load_multiclass_reqs(desc):
    multiclass_reqs = {}
    if "multiclassing" in desc.keys():
        for k, v in desc["multiclassing"]["requirements"].items():
            if k == "or":
                multiclass_reqs["or"] = [
                    {ABILITY_MAP[a]: b for a, b in x.items()} for x in v
                ]
            else:
                multiclass_reqs[ABILITY_MAP[k]] = v

    return multiclass_reqs


def load_spellcasting(data):
    if not "spellcastingAbility" in data.keys():
        return None
    return {
        "ability": ABILITY_MAP[data["spellcastingAbility"]],
        "progression": data["casterProgression"],
        "cantrip_progression": data["cantripProgression"]
        if "cantripProgression" in data.keys()
        else [],
    }


def load_class_feature(source_data, descriptor, optional):
    if type(descriptor) == dict:
        gain_scf = (
            descriptor["gainSubclassFeature"]
            if "gainSubclassFeature" in descriptor
            else False
        )
        descriptor = descriptor["classFeature"]
    else:
        gain_scf = False

    parts = descriptor.split("|")
    item = None
    if len(parts) >= 6:
        name = parts[0]
        class_name = parts[1]
        sc_name = parts[3]
        source = parts[4] if len(parts) == 6 else parts[6]
        level = int(parts[5])

        for i in source_data["subclassFeature"]:
            if (
                i["name"].lower() == name.lower()
                and (i["source"].lower() == source.lower() or source == "")
                and (i["subclassShortName"].lower() == sc_name.lower() or sc_name == "")
                and (i["className"].lower() == class_name.lower() or class_name == "")
                and i["level"] == level
            ):
                item = i
    else:
        name = parts[0]
        class_name = parts[1]
        source = parts[2] if len(parts) == 4 else parts[4]
        level = int(parts[3])

        for i in source_data["classFeature"]:
            if (
                i["name"].lower() == name.lower()
                and (i["source"].lower() == source.lower() or source == "")
                and i["className"].lower() == class_name.lower()
                and i["level"] == level
            ):
                item = i

    if not item:
        return None

    return {
        "name": item["name"],
        "type": "subclass" if len(parts) >= 6 else "class",
        "gain_scf": gain_scf,
        "source": item["source"],
        "level": item["level"],
        "entries": parse_5etools_entries(
            item["entries"],
            source_data["classFeature"] if "classFeature" in source_data.keys() else [],
            source_data["subclassFeature"]
            if "subclassFeature" in source_data.keys()
            else [],
            optional,
        ),
    }


def load_subclass(desc, data, optional):
    sc_spells = {}
    if "additionalSpells" in desc.keys():
        for s in desc["additionalSpells"]:
            if "prepared" in s.keys():
                for k in s["prepared"].keys():
                    if not k in sc_spells.keys():
                        sc_spells[k] = []
                    sc_spells[k].extend(s["prepared"][k])
    features = (
        [load_class_feature(data, feat, optional) for feat in desc["subclassFeatures"]]
        if "subclassFeature" in data.keys() and "subclassFeatures" in desc.keys()
        else []
    )

    return {
        "name": desc["name"],
        "name_short": desc["shortName"],
        "source": desc["source"],
        "subclass_spells": sc_spells,
        "features": features,
    }


def normalize_slug(slug):
    return "".join(
        map(
            (lambda x: x if x in string.ascii_letters or x in string.digits else "_"),
            slug,
        )
    )


def load_one_class(
    desc: Dict[str, Any], data: Dict[str, Any], optional: Dict[str, Any]
) -> Dict[str, Any]:
    return {
        "slug": normalize_slug(desc["name"].lower() + "-" + desc["source"].lower()),
        "name": desc["name"],
        "source": desc["source"],
        "hit_dice": desc["hd"],
        "save_proficiency": [ABILITY_MAP[p] for p in desc["proficiency"]]
        if "proficiency" in desc.keys()
        else [],
        "armor_proficiency": [
            parse_5etools_string(p if type(p) == str else p["proficiency"])
            for p in desc["startingProficiencies"]["armor"]
        ]
        if "startingProficiencies" in desc.keys()
        and "armor" in desc["startingProficiencies"].keys()
        else [],
        "weapon_proficiency": [
            parse_5etools_string(p if type(p) == str else p["proficiency"])
            for p in desc["startingProficiencies"]["weapons"]
        ]
        if "startingProficiencies" in desc.keys()
        and "weapons" in desc["startingProficiencies"].keys()
        else [],
        "tool_proficiency": [
            parse_5etools_string(p if type(p) == str else p["proficiency"])
            for p in desc["startingProficiencies"]["tools"]
        ]
        if "startingProficiencies" in desc.keys()
        and "tools" in desc["startingProficiencies"].keys()
        else [],
        "skill_proficiency": load_skills(desc["startingProficiencies"]["skills"])
        if "startingProficiencies" in desc.keys()
        and "skills" in desc["startingProficiencies"].keys()
        else [],
        "starting_equipment": load_starting_equipment(desc["startingEquipment"])
        if "startingEquipment" in desc.keys()
        else None,
        "multiclass_requirements": load_multiclass_reqs(desc),
        "multiclass_armor_proficiency": [
            parse_5etools_string(p if type(p) == str else p["proficiency"])
            for p in desc["multiclassing"]["proficienciesGained"]["armor"]
        ]
        if "multiclassing" in desc.keys()
        and "proficienciesGained" in desc["multiclassing"].keys()
        and "armor" in desc["multiclassing"]["proficienciesGained"].keys()
        else [],
        "multiclass_weapon_proficiency": [
            parse_5etools_string(p if type(p) == str else p["proficiency"])
            for p in desc["multiclassing"]["proficienciesGained"]["weapons"]
        ]
        if "multiclassing" in desc.keys()
        and "proficienciesGained" in desc["multiclassing"].keys()
        and "weapons" in desc["multiclassing"]["proficienciesGained"].keys()
        else [],
        "multiclass_tool_proficiency": [
            parse_5etools_string(p if type(p) == str else p["proficiency"])
            for p in desc["multiclassing"]["proficienciesGained"]["tools"]
        ]
        if "multiclassing" in desc.keys()
        and "proficienciesGained" in desc["multiclassing"].keys()
        and "tools" in desc["multiclassing"]["proficienciesGained"].keys()
        else [],
        "multiclass_skill_proficiency": load_skills(
            desc["startingProficiencies"]["skills"]
        )
        if "multiclassing" in desc.keys()
        and "proficienciesGained" in desc["multiclassing"].keys()
        and "skills" in desc["multiclassing"]["proficienciesGained"].keys()
        else None,
        "spellcasting": load_spellcasting(desc),
        "features": [
            load_class_feature(data, i, optional) for i in desc["classFeatures"]
        ],
        "subclasses": [load_subclass(s, data, optional) for s in data["subclass"]]
        if "subclass" in data.keys()
        else [],
        "fluff": parse_5etools_entries(
            desc["fluff"],
            data["classFeature"] if "classFeature" in data.keys() else [],
            data["subclassFeature"] if "subclassFeature" in data.keys() else [],
            optional,
        )
        if "fluff" in desc.keys()
        else None,
    }


def load_classes(data_root: str, output_folder: str) -> None:
    out = {}
    with open(os.path.join(data_root, "optionalfeatures.json"), "r") as fp:
        optional = json.load(fp)
    for file in os.listdir(os.path.join(data_root, "class")):
        if file in EXCLUDE:
            continue
        with open(os.path.join(data_root, "class", file), "r") as fp:
            raw = json.load(fp)

        if not (
            "class" in raw.keys()
            and "subclass" in raw.keys()
            and "classFeature" in raw.keys()
            and "subclassFeature" in raw.keys()
        ):
            print(f"WARN: {file} does not have required keys, skipping.")
            continue

        for _class in raw["class"]:
            current = load_one_class(_class, raw, optional)
            key = current["slug"]
            print(f"INF: Processed {key}")
            out[key] = current.copy()

    for k in out.keys():
        with open(os.path.join(output_folder, k + ".json"), "w") as fp:
            json.dump(out[k], fp, indent=4)


if __name__ == "__main__":
    load_classes("../_data", "../data/classes")
