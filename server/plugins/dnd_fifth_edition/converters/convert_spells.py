import json
from conv_util import parse_5etools_string
from glob import glob
import os
from typing import TypedDict, Optional, Union, Literal, Any

SPELL_SCHOOL = Literal[
    "conjuration",
    "necromancy",
    "evocation",
    "abjuration",
    "transmutation",
    "divination",
    "enchantment",
    "illusion",
]

SCHOOL_MAP = {
    "E": "enchantment",
    "V": "evocation",
    "A": "abjuration",
    "D": "divination",
    "C": "conjuration",
    "N": "necromancy",
    "I": "illusion",
    "T": "transmutation",
}


class SpellComponents(TypedDict):
    verbal: bool
    somatic: bool
    material: Union[str, bool]
    royalty: bool


class SpellCastingTime(TypedDict):
    number: int
    unit: str
    condition: Optional[str]


class SpellRange(TypedDict):
    type: str
    target_type: Optional[str]
    range: Optional[int]


class SpellDuration(TypedDict):
    type: str
    duration_type: Optional[str]
    value: Optional[int]
    concentration: bool
    up_to: bool
    ends_on: Optional[list[str]]


class SpellList(TypedDict):
    type: Literal["class", "subclass", "race", "background"]
    name: str
    source: str
    sub_name: Optional[str]
    sub_source: Optional[str]


class SpellItem(TypedDict):
    name: str
    source: str
    page: int
    level: int
    school: SPELL_SCHOOL
    components: SpellComponents
    casting_time: list[SpellCastingTime]
    range: SpellRange
    duration: list[SpellDuration]
    conditions: Optional[list[str]]
    damage_types: Optional[list[str]]
    immune: Optional[list[str]]
    resist: Optional[list[str]]
    vulnerable: Optional[list[str]]
    condition_immune: Optional[list[str]]
    saving_throw: Optional[list[str]]
    text: list[str]
    spell_attack: Literal["melee", "ranged"]
    spell_lists: list[SpellList]


class SpellParser:
    def __init__(self, path: str):
        self.file_map: dict[str, dict] = {}
        for i in glob(path):
            with open(i, "r") as f:
                self.file_map[
                    os.path.split(i)[1].split(".")[0].split("-", maxsplit=1)[1]
                ] = json.load(f)["spell"]

    def _clean_list(self, item: list) -> list:
        result = []
        for i in item:
            if type(i) == dict:
                result.append(self._recursive_clean(i))
            elif type(i) == list:
                result.append(self._clean_list(i))
            else:
                result.append(i)
        return result

    def _recursive_clean(self, item: dict) -> dict:
        cleaned = {}
        for k, v in item.items():
            if type(v) == dict and v != {}:
                cleaned[k] = self._recursive_clean(v)
            elif type(v) == list and v != []:
                cleaned[k] = self._clean_list(v)
            elif v != [] and v != {} and v != None:
                cleaned[k] = v

        return cleaned

    def _parse_one_entry(self, entry: Union[str, dict]) -> list[str]:
        if type(entry) != dict:
            return [parse_5etools_string(str(entry))]
        else:
            et = entry["type"]
            if et == "entries":
                entry_lines = self._parse_entries(entry["entries"])
                if "name" in entry.keys():
                    entry_lines[0] = f"***{entry['name']}.*** {entry_lines[0]}"
                entry_lines.insert(0, "")
                entry_lines.append("")
                return entry_lines
            elif et == "list":
                return [f"- {i}" for i in self._parse_entries(entry["items"])]
            elif et == "item":
                return [
                    "**{name}:** {entry}".format(
                        name=entry["name"],
                        entry="\n".join(self._parse_one_entry(entry["entry"]))
                        if "entry" in entry.keys()
                        else "",
                    )
                ]
            elif et == "inset" or et == "quote":
                entry_lines = [""]
                if "name" in entry.keys():
                    entry_lines.append(f"> **{entry['name']}**")
                entry_lines.extend(
                    ["> " + i for i in self._parse_entries(entry["entries"])]
                )
                entry_lines.append("")
                return entry_lines
            elif et == "section":
                entry_lines = [""]
                for k in entry["entries"]:
                    if (
                        type(k) == dict
                        and k["type"] == "entries"
                        and "name" in k.keys()
                    ):
                        entry_lines.append(f"## {k['name']}")
                        entry_lines.extend(self._parse_entries(k["entries"]))
                    else:
                        entry_lines.extend(self._parse_one_entry(k))
                entry_lines.append("")
                return entry_lines
            elif et == "table":
                entry_lines = [""]
                if len(entry.get("caption", "")) > 0:
                    entry_lines.append(f"**{entry['caption']}**")

                entry_lines.append(
                    parse_5etools_string(f"|{'|'.join(entry['colLabels'])}|")
                )
                entry_lines.append(
                    f"|{'|'.join([':-:' for i in range(len(entry['colLabels']) + 1)])}|"
                )
                for row in entry["rows"]:
                    entry_lines.append(
                        f"|{'|'.join([self._parse_one_entry(c)[0] for c in row])}|"
                    )
                entry_lines.append("")
                return entry_lines
            elif et == "cell":
                result = self._parse_one_entry(entry.get("entry", ""))[0]
                if "roll" in entry.keys():
                    if "exact" in entry["roll"].keys():
                        result = (
                            f"{entry['roll']['exact']} : {result}"
                            if len(result) > 0
                            else str(entry["roll"]["exact"])
                        )
                    elif (
                        "min" in entry["roll"].keys() and "max" in entry["roll"].keys()
                    ):
                        result = (
                            f"{entry['roll']['min']} - {entry['roll']['max']} : {result}"
                            if len(result) > 0
                            else f"{entry['roll']['min']} - {entry['roll']['max']}"
                        )
                return [result]

            else:
                print(et)
        return [""]

    def _parse_entries(self, entries: list[Union[str, dict]]) -> list[str]:
        out = []
        for e in entries:
            out.extend(self._parse_one_entry(e))
        return out

    def _convert_one(self, spell: dict[str, Any]) -> SpellItem:
        # Parse material components
        if "m" in spell.get("components", {}).keys():
            if type(spell["components"]["m"]) == str:
                material = spell["components"]["m"]
            else:
                material = spell["components"]["m"].get("text", True)
        else:
            material = False

        # Parse casting time
        ctimes = []
        for c in spell.get("time", []):
            ctimes.append(
                SpellCastingTime(
                    number=c.get("number", 1),
                    unit=c.get("unit", "action"),
                    condition=c.get("condition", None),
                )
            )

        # Parse range
        if "distance" in spell.get("range", {}).keys():
            if "amount" in spell["range"]["distance"].keys():
                spell_range = SpellRange(
                    type=spell["range"].get("type", ""),
                    target_type=spell["range"]["distance"].get("type", ""),
                    range=spell["range"]["distance"]["amount"],
                )
            else:
                spell_range = SpellRange(
                    type=spell["range"].get("type", ""),
                    target_type=spell["range"]["distance"].get("type", ""),
                )
        else:
            spell_range = SpellRange(type=spell["range"].get("type", ""))

        # Parse duration
        durations = []
        for d in spell.get("duration", []):
            durations.append(
                SpellDuration(
                    type=d.get("type", ""),
                    duration_type=d.get("duration", {}).get("type", None),
                    value=d.get("duration", {}).get("amount", None),
                    concentration=d.get("concentration", None),
                    up_to=d.get("duration", {}).get("upTo", None),
                    ends_on=d.get("ends", None),
                )
            )

        # Parse entries
        spell_entries = self._parse_entries(spell.get("entries", []))

        if "entriesHigherLevel" in spell.keys():
            spell_entries.append("")
            spell_entries.extend(
                self._parse_entries(spell.get("entriesHigherLevel", []))
            )

        last = None
        normal_entries = []
        for e in spell_entries:
            if e == "" and last == "":
                pass
            else:
                normal_entries.append(e)
                last = e

        if len(normal_entries) > 0 and normal_entries[-1] == "":
            del normal_entries[-1]
        if len(normal_entries) > 0 and normal_entries[0] == "":
            del normal_entries[0]

        # Parse spell lists
        spell_lists = []
        for l in spell.get("classes", {}).get("fromClassList", []):
            spell_lists.append(
                SpellList(
                    type="class", name=l.get("name", None), source=l.get("source", None)
                )
            )
        for l in spell.get("classes", {}).get("fromSubclass", []):
            spell_lists.append(
                SpellList(
                    type="subclass",
                    name=l.get("class", {}).get("name", None),
                    source=l.get("class", {}).get("source", None),
                    sub_name=l.get("subclass", {}).get("name", None),
                    sub_source=l.get("subclass", {}).get("source", None),
                )
            )
        for l in spell.get("races", []):
            spell_lists.append(
                SpellList(
                    type="race",
                    name=l.get("baseName", None),
                    source=l.get("baseSource", None),
                    sub_name=l.get("name", None),
                    sub_source=l.get("source", None),
                )
            )
        for l in spell.get("backgrounds", []):
            spell_lists.append(
                SpellList(
                    type="background", name=l.get("name", None), source=l.get("source")
                )
            )

        return SpellItem(
            name=spell.get("name", ""),
            source=spell.get("source", ""),
            page=spell.get("page", None),
            level=spell.get("level", 0),
            school=SCHOOL_MAP.get(spell.get("school", ""), None),
            components=SpellComponents(
                verbal=spell.get("components", {}).get("v", False),
                somatic=spell.get("components", {}).get("s", False),
                material=material,
                royalty=spell.get("components", {}).get("r", False),
            ),
            casting_time=ctimes,
            range=spell_range,
            duration=durations,
            conditions=spell.get("conditionInflict", None),
            damage_types=spell.get("damageInflict", None),
            immune=spell.get("damageImmune", None),
            resist=spell.get("damageResist", None),
            vulnerable=spell.get("damageVulnerable", None),
            condition_immune=spell.get("conditionImmune", None),
            saving_throw=spell.get("savingThrow", None),
            spell_attack="melee"
            if "M" in spell.get("spellAttack", [])
            else ("ranged" if "R" in spell.get("spellAttack", []) else None),
            text=normal_entries,
            spell_lists=spell_lists,
        )

    def convert(self, out_directory: str):
        if not os.path.exists(out_directory):
            os.makedirs(out_directory, exist_ok=True)

        for n, d in self.file_map.items():
            with open(os.path.join(out_directory, f"spells-{n}.json"), "w") as f:
                json.dump(
                    [self._recursive_clean(self._convert_one(i)) for i in d],
                    f,
                    indent=4,
                )


if __name__ == "__main__":
    parser = SpellParser("../_data/spells/spells-*.json")
    parser.convert("../data/spells")
