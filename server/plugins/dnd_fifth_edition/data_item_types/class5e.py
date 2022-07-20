import json
import os
from turtle import back
from typing import Optional, List
from util.exceptions import BaseHTTPException, PluginDataArgumentError
from util.plugin_utils import *
from util import *
from pydantic import BaseModel
from ..constants import *
from ..util5e import *


class MinimalClassDescriptor(BaseModel):
    class_name: str
    source_name: str
    subclass_name: Optional[str] = None


class SkillChoose5e(AbstractDataSourceItem):
    subtype: str = "class_5e.skill_choose"
    plugin: str = "dnd_fifth_edition"

    def __init__(
        self,
        name: str = None,
        mode: str = None,
        count: int = None,
        choose_from: List[str] = [],
        **kwargs,
    ):
        super().__init__(name, **kwargs)
        self.mode = mode
        self.count = count
        self.choose_from = choose_from

    @classmethod
    def load(cls, data: Dict):
        return cls(
            name="skillChoose",
            mode="choose" if "choose" in data.keys() else "any",
            count=data["choose"]["count"] if "choose" in data.keys() else data["any"],
            choose_from=data["choose"]["from"] if "choose" in data.keys() else [],
        )


class StartingEquipment5e(AbstractDataSourceItem):
    subtype: str = "class_5e.starting_equipment"
    plugin: str = "dnd_fifth_edition"

    def __init__(
        self,
        name: str = None,
        background_items: bool = None,
        gold: str = None,
        items: List[str] = [],
        **kwargs,
    ):
        super().__init__(name, **kwargs)
        self.background_items = background_items
        self.gold = gold
        self.items = items

    @classmethod
    def load(cls, data: Any):
        return cls(
            name="startingEquipment",
            backgroundItems=data["additionalFromBackground"],
            gold=parse_5etools_string(data["goldAlternative"]),
            items=[parse_5etools_string(i) for i in data["default"]],
        )


class Spellcasting5e(AbstractDataSourceItem):
    subtype: str = "class_5e.spellcasting"
    plugin: str = "dnd_fifth_edition"

    def __init__(
        self,
        name: str = None,
        ability: str = None,
        progression: str = None,
        cantrip_progression: List[int] = [],
        **kwargs,
    ):
        super().__init__(name, **kwargs)
        self.ability = ability
        self.progression = progression
        self.cantrip_progression = cantrip_progression

    @classmethod
    def load(cls, data: Any):
        return cls(
            name="spellcasting",
            ability=ABILITY_MAP[data["spellcastingAbility"]],
            progression=data["casterProgression"],
            cantrip_progression=data["cantripProgression"],
        )

    @property
    def spell_progression(self):
        return SPELLSLOT_MAP[self.progression]


class Class5e(AbstractDataSourceItem):
    subtype: str = "class_5e"
    plugin: str = "dnd_fifth_edition"

    def __init__(
        self,
        name: str = None,
        source: str = None,
        subclass: Any = None,
        hit_dice: str = None,
        save_proficiency: List[str] = [],
        armor_proficiency: List[str] = [],
        weapon_proficiency: List[str] = [],
        tool_proficiency: List[str] = [],
        skill_proficiency: List[SkillChoose5e] = [],
        starting_equipment: StartingEquipment5e = None,
        multiclass_requirements: Dict[str, int] = {},
        multiclass_armor_proficiency: List[str] = [],
        multiclass_weapon_proficiency: List[str] = [],
        multiclass_tool_proficiency: List[str] = [],
        multiclass_skill_proficiency: List[SkillChoose5e] = [],
        spellcasting: Spellcasting5e = None,
        **kwargs,
    ):
        super().__init__(name, **kwargs)

    @staticmethod
    def verify_class(classes: List, name: str, source: str):
        for c in classes:
            if (
                c["name"].lower() == name.lower()
                and c["source"].lower() == source.lower()
            ):
                return c
        raise PluginDataArgumentError(
            extra=f"Source {source}/Class {name} does not exist"
        )

    @staticmethod
    def verify_subclass(subclasses: List, name: str, source: str):
        for c in subclasses:
            if (
                c["name"].lower() == name.lower()
                or c["shortName"].lower() == name.lower()
            ) and c["classSource"].lower() == source.lower():
                return c
        raise PluginDataArgumentError(
            extra=f"Source {source}/Subclass {name} does not exist"
        )

    @staticmethod
    def verify_class_feature(features: List, name: str, source: str):
        for c in features:
            if (
                c["name"].lower() == name.lower()
                and c["source"].lower() == source.lower()
            ):
                return c
        raise PluginDataArgumentError(
            extra=f"Source {source}/Class Feature {name} does not exist"
        )

    @staticmethod
    def verify_subclass_feature(features: List, name: str, source: str):
        for c in features:
            if (
                c["name"].lower() == name.lower()
                and c["source"].lower() == source.lower()
            ):
                return c
        raise PluginDataArgumentError(
            extra=f"Source {source}/Subclass Feature {name} does not exist"
        )

    @classmethod
    def load(cls, plugin: Plugin, source_map: Any, data: MinimalClassDescriptor):
        source_file = os.path.join(
            plugin.plugin_directory,
            get_nested(source_map, f"class.class-{data.class_name.lower()}"),
        )

        with open(source_file, "r") as f:
            superclass = json.load(f)

        class_raw = Class5e.verify_class(
            superclass["class"], data.class_name, data.source_name
        )
        if data.subclass_name:
            subclass_raw = Class5e.verify_subclass(
                superclass["subclass"], data.subclass_name, data.source_name
            )
        else:
            subclass_raw = None
