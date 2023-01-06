import json
from typing import TypedDict, Union, Literal, Optional, Any
from conv_util import parse_5etools_string
import re

TAG_TYPE = Literal["sentient", "cursed", "srd"]

BONUS_TYPE = Optional[Union[str, int]]
WEAPON_TYPES = [
    "axe",
    "bow",
    "club",
    "crossbow",
    "dagger",
    "firearm",
    "hammer",
    "mace",
    "net",
    "spear",
]

EXCLUDE_TYPES = ["AIR", "SHP", "VEH", "MNT"]


class Bonuses(TypedDict):
    ability_check: BONUS_TYPE
    armor_class: BONUS_TYPE
    proficiency_bonus: BONUS_TYPE
    saving_throw: BONUS_TYPE
    spell_attack: BONUS_TYPE
    spell_save: BONUS_TYPE
    weapon_attack: BONUS_TYPE
    weapon_crit: BONUS_TYPE
    weapon_damage: BONUS_TYPE


BONUS_MAP = {
    "ability_check": "bonusAbilityCheck",
    "armor_class": "bonusAc",
    "proficiency_bonus": "bonusProficiencyBonus",
    "saving_throw": "bonusSavingThrow",
    "spell_attack": "bonusSpellAttack",
    "spell_save": "bonusSpellSaveDc",
    "weapon_attack": "bonusWeaponAttack",
    "weapon_crit": "bonusWeaponCritDamage",
    "weapon_damage": "bonusWeaponDamage",
}

ABILITY_MAP = {
    "str": "strength",
    "dex": "dexterity",
    "con": "constitution",
    "int": "intelligence",
    "wis": "wisdom",
    "cha": "charisma",
}

DAMAGE_TYPE = Literal[
    "slashing",
    "piercing",
    "bludgeoning",
    "poison",
    "acid",
    "fire",
    "cold",
    "radiant",
    "necrotic",
    "lightning",
    "thunder",
    "force",
    "psychic",
]


class AbilityMod(TypedDict):
    type: Literal["modify", "set"]
    value: int


class AbilityType(TypedDict):
    strength: Optional[AbilityMod]
    dexterity: Optional[AbilityMod]
    constitution: Optional[AbilityMod]
    intelligence: Optional[AbilityMod]
    wisdom: Optional[AbilityMod]
    charisma: Optional[AbilityMod]


class DamageType(TypedDict):
    amount: str
    type: DAMAGE_TYPE


class ItemType(TypedDict):
    types: list[str]
    name: str
    source: str
    page: int
    resist: list[str]
    immune: list[str]
    vulnerable: list[str]
    conditionImmune: list[str]
    weight: Optional[float]
    value: Optional[float]
    text: list[str]
    bonuses: Bonuses
    related_spells: list[str]
    abilities: AbilityType

    # Spellcasting focus-related fields
    focus_for: Optional[Union[list[str], bool]]
    focus_type: Optional[str]

    # Armor-related fields
    armor_class: Optional[int]
    strength_required: Optional[int]
    stealth_disadvantage: Optional[bool]

    # Attack-related fields
    weapon_type: Optional[list[str]]
    range: Optional[list[int]]
    damage_dice: Optional[list[str]]
    damage_type: Optional[str]
    reload: Optional[int]

    # Magic item-related fields
    rarity: Optional[str]
    attunement: Optional[Union[bool, str]]
    recharge: Optional[str]
    charges: Optional[int]


class ItemConverter:
    TYPE_MAP = {
        "$": ["treasure"],
        "TG": ["trade"],
        "M": ["melee", "weapon"],
        "R": ["range", "weapon"],
        "EXP": ["explosive", "weapon"],
        "LA": ["light", "armor"],
        "MA": ["medium", "armor"],
        "HA": ["heavy", "armor"],
        "S": ["shield", "armor"],
        "RD": ["rod", "magic"],
        "WD": ["wand", "magic"],
        "G": ["gear"],
        "AT": ["tool", "artisan"],
        "T": ["tool"],
        "AF": ["ammo", "futuristic"],
        "A": ["ammo"],
        "TAH": ["gear"],
        "SC": ["scroll", "magic"],
        "MR": ["magic", "rune"],
        "FD": ["gear", "food"],
        "RG": ["ring", "magic"],
        "GS": ["tool", "gaming"],
        "SCF": ["magic", "gear", "focus"],
        "P": ["magic", "potion"],
        "INS": ["tool", "instrument"],
    }

    DMG_MAP = {
        "S": "slashing",
        "N": "necrotic",
        "R": "radiant",
        "P": "piercing",
        "B": "bludgeoning",
        "O": "force",
    }

    def __init__(self, main: str, base: str):
        with open(main, "r") as f:
            main_raw = json.load(f)
        with open(base, "r") as f:
            base_raw = json.load(f)

        self.items_raw = []
        self.items_raw.extend(main_raw["item"])
        self.items_raw.extend(base_raw["baseitem"])
        self.property_map = {i["abbreviation"]: i for i in base_raw["itemProperty"]}
        self.type_map = {i["abbreviation"]: i for i in base_raw["itemType"]}
        self.entry_map = {i["name"]: i for i in base_raw["itemEntry"]}

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

                entry_lines.append(f"|{'|'.join(entry['colLabels'])}|")
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
                        result = f"{entry['roll']['exact']} : {result}"
                    elif (
                        "min" in entry["roll"].keys() and "max" in entry["roll"].keys()
                    ):
                        result = f"{entry['roll']['min']} - {entry['roll']['max']} : {result}"
                return [result]

            else:
                print(et)
        return [""]

    def _parse_entries(self, entries: list[Union[str, dict]]) -> list[str]:
        lines = []
        for entry in entries:
            lines.extend(self._parse_one_entry(entry))

        return lines

    def _convert_one(self, item: dict[str, Any]) -> ItemType:
        # Get tags
        itypes = []
        for t in [
            "weapon",
            "armor",
            "poison",
            "tattoo",
            "wondrous",
            "curse",
            "sentient",
        ]:
            if item.get(t, False):
                itypes.append(t)

        if "type" in item.keys() and item["type"] in self.TYPE_MAP.keys():
            itypes.extend(self.TYPE_MAP[item["type"]])

        if "S" in item.get("property", []):
            itypes.append("special")

        # Get bonuses
        bonuses: Bonuses = {}
        for k in BONUS_MAP.keys():
            if BONUS_MAP[k] in item.keys():
                if "d" in item[BONUS_MAP[k]]:
                    bonuses[k] = item[BONUS_MAP[k]]
                else:
                    bonuses[k] = int(item[BONUS_MAP[k]])

        if item.get("bonusWeapon", False):
            if "d" in item["bonusWeapon"]:
                val = item["bonusWeapon"]
            else:
                val = int(item["bonusWeapon"])
            bonuses["weapon_attack"] = val
            bonuses["weapon_damage"] = val

        # Get weapon type
        weapon_type = None
        for k in WEAPON_TYPES:
            if item.get(k, False):
                weapon_type = k

        # Parse ability mods
        abilities: AbilityType = {}
        if "ability" in item.keys():
            for k in ABILITY_MAP.keys():
                if k in item["ability"].keys():
                    abilities[ABILITY_MAP[k]] = AbilityMod(
                        type="modify", value=item["ability"][k]
                    )

            if "static" in item["ability"].keys():
                for k in ABILITY_MAP.keys():
                    if k in item["ability"]["static"].keys():
                        abilities[ABILITY_MAP[k]] = AbilityMod(
                            type="set", value=item["ability"]["static"][k]
                        )

        # Parse item entries
        item_entries = self._parse_entries(item.get("entries", []))

        for p in item.get("property", []):
            if p in self.property_map.keys():
                prop = self.property_map[p]
                if not "entries" in prop.keys():
                    continue
                prop_entries = [""]
                new_entries = self._parse_entries(prop["entries"])
                if len(new_entries) > 1:
                    prop_entries.extend(new_entries[: len(new_entries) - 1])
                if "source" in prop.keys() and "page" in prop.keys():
                    prop_entries.append(f"*({prop['source']} - pg. {prop['page']})*")
                prop_entries.append("")
                item_entries.extend(prop_entries)
            else:
                print(f"UNKNOWN PROPERTY: {p}")

        if item.get("type", None) in self.type_map.keys():
            tp = self.type_map[item["type"]]
            type_entries = [""]
            if "name" in tp.keys():
                type_entries.append(f"## {tp['name']}")
            new_entries = self._parse_entries(tp["entries"])
            type_entries.extend(new_entries)
            if "source" in tp.keys() and "page" in tp.keys():
                type_entries.append(f"*({tp['source']} - pg. {tp['page']})*")
            type_entries.append("")
            item_entries.extend(type_entries)

        last = None
        normal_entries = []
        for e in item_entries:
            if e == "" and last == "":
                pass
            else:
                normal_entries.append(e)
                last = e

        if len(normal_entries) > 0 and normal_entries[-1] == "":
            del normal_entries[-1]
        if len(normal_entries) > 0 and normal_entries[0] == "":
            del normal_entries[0]

        return ItemType(
            type=list(set(itypes)),
            name=item.get("name", ""),
            source=item.get("source", None),
            page=item.get("page", None),
            resist=item.get("resist", []),
            immune=item.get("immune", []),
            vulnerable=item.get("vulnerable", []),
            conditionImmune=item.get("conditionImmune", []),
            weight=item.get("weight", None),
            value=item.get("value", None),
            related_spells=item.get("attachedSpells", []),
            bonuses=bonuses,
            focus_for=item.get("focus", None),
            focus_type=item.get("scfType", None),
            armor_class=item.get("ac", None),
            strength_required=item.get("strength", None),
            stealth_disadvantage=item.get("stealth", None),
            weapon_type=weapon_type,
            range=[int(i) for i in item["range"].split("/")]
            if "range" in item.keys()
            else None,
            damage_dice=[
                item[f"dmg{i}"] for i in range(1, 3) if f"dmg{i}" in item.keys()
            ],
            damage_type=self.DMG_MAP[item["dmgType"]]
            if "dmgType" in item.keys() and item["dmgType"] in self.DMG_MAP.keys()
            else None,
            text=normal_entries,
            reload=item.get("reload", None),
            rarity=item.get("rarity", None)
            if item.get("rarity", None) != "none"
            else None,
            attunement=item.get("reqAttune", None),
            recharge=item.get("recharge", None),
            charges=item.get("charges", None),
            abilities=abilities,
        )

    def convert(self, output: str):
        items = []
        for i in self.items_raw:
            if i.get("type", None) in EXCLUDE_TYPES:
                continue
            items.append(
                {
                    k: v
                    for k, v in self._convert_one(i).items()
                    if v != None and v != [] and v != {}
                }
            )

        with open(output, "w") as f:
            json.dump(items, f, indent=4)

        with open("test-items-raw.json", "w") as f:
            json.dump(self.items_raw, f, indent=4)


if __name__ == "__main__":
    converter = ItemConverter("../_data/items.json", "../_data/items-base.json")
    converter.convert("./test-items.json")
