import json
from typing import TypedDict, Union, Literal, Optional, Any

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
    text: str
    bonuses: Bonuses
    related_spells: list[str]

    # Spellcasting focus-related fields
    focus_for: Optional[Union[list[str], bool]]
    focus_type: Optional[str]

    # Armor-related fields
    armor_type: Optional[Literal["light", "medium", "heavy", "shield"]]
    armor_class: Optional[int]
    strength_required: Optional[int]
    stealth_disadvantage: Optional[bool]

    # Attack-related fields
    attack_type: Optional[Literal["melee", "range"]]
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
        )

    def convert(self, output: str):
        items = []
        for i in self.items_raw:
            if i.get("type", None) in EXCLUDE_TYPES:
                continue
            items.append(self._convert_one(i))

        with open(output, "w") as f:
            json.dump(items, f, indent=4)

        with open("test-items-raw.json", "w") as f:
            json.dump(self.items_raw, f, indent=4)


if __name__ == "__main__":
    converter = ItemConverter("../_data/items.json", "../_data/items-base.json")
    converter.convert("./test-items.json")
