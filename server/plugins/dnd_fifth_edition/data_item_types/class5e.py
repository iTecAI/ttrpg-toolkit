import json
import os
from typing import Optional, List
from util.exceptions import BaseHTTPException, PluginDataArgumentError
from util.plugin_utils import *
from util import *
from pydantic import BaseModel
from ..constants import *
from ..util5e import *


class MinimalClassDescriptor(BaseModel):
    class_file: str
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
            backgroundItems=data["additionalFromBackground"]
            if "additionalFromBackground"
            else None,
            gold=parse_5etools_string(data["goldAlternative"])
            if "goldAlternative" in data.keys()
            else None,
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
        self.spell_progression = SPELLSLOT_MAP[self.progression]

    @classmethod
    def load(cls, data: Any):
        if not "spellcastingAbility" in data.keys():
            return None
        return cls(
            name="spellcasting",
            ability=ABILITY_MAP[data["spellcastingAbility"]],
            progression=data["casterProgression"],
            cantrip_progression=data["cantripProgression"]
            if "cantripProgression" in data.keys()
            else [],
        )


class ClassFeature5e(AbstractDataSourceItem):
    subtype: str = "class_5e.feature"
    plugin: str = "dnd_fifth_edition"

    def __init__(
        self,
        name: str = None,
        type: str = None,
        gain_scf: bool = False,
        source: str = None,
        level: int = 1,
        entries: List[str] = [],
        **kwargs,
    ):
        super().__init__(name, **kwargs)
        self.type = type
        self.gain_scf = gain_scf
        self.source = source
        self.level = level
        self.entries = entries

    @classmethod
    def load(
        cls, source_data: Dict[str, Any], descriptor: str | dict, optional: List[Dict]
    ):
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
                    and (
                        i["subclassShortName"].lower() == sc_name.lower()
                        or sc_name == ""
                    )
                    and (
                        i["className"].lower() == class_name.lower() or class_name == ""
                    )
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

        return cls(
            name=item["name"],
            type="subclass" if len(parts) >= 6 else "class",
            gain_scf=gain_scf,
            source=item["source"],
            level=item["level"],
            entries=parse_5etools_entries(
                item["entries"],
                source_data["classFeature"]
                if "classFeature" in source_data.keys()
                else [],
                source_data["subclassFeature"]
                if "subclassFeature" in source_data.keys()
                else [],
                optional,
            ),
        )


class Subclass5e(AbstractDataSourceItem):
    subtype: str = "class_5e.subclass"
    plugin: str = "dnd_fifth_edition"

    def __init__(
        self,
        name: str = None,
        name_short: str = None,
        source: str = None,
        subclass_spells: Dict[int, List[str]] = {},
        features: List[ClassFeature5e] = [],
        **kwargs,
    ):
        super().__init__(name, **kwargs)
        self.name_short = name_short
        self.source = source
        self.subclass_spells = subclass_spells
        self.features = features

    @classmethod
    def load(cls, plugin: Plugin, source_map: Any, superclass: Any, data: Any):
        sc_spells = {}
        if "additionalSpells" in data.keys():
            for s in data["additionalSpells"]:
                if "prepared" in s.keys():
                    for k in s["prepared"].keys():
                        if not k in sc_spells.keys():
                            sc_spells[k] = []
                        sc_spells[k].extend(s["prepared"][k])

        opt_file = os.path.join(
            plugin.plugin_directory,
            get_nested(source_map, "optionalfeatures"),
        )

        with open(opt_file, "r") as f:
            optional_features = json.load(f)

        features = (
            [
                ClassFeature5e.load(superclass, feat, optional_features)
                for feat in data["subclassFeatures"]
            ]
            if "subclassFeatures" in data.keys()
            else []
        )

        return Subclass5e(
            name=data["name"],
            name_short=data["shortName"],
            source=data["source"],
            subclass_spells=sc_spells,
            features=features,
        )


class Class5e(AbstractDataSourceItem):
    subtype: str = "class_5e"
    plugin: str = "dnd_fifth_edition"

    def __init__(
        self,
        name: str = None,
        source: str = None,
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
        features: List[ClassFeature5e] = [],
        subclasses: List[Subclass5e] = [],
        fluff: List[str] = [],
        **kwargs,
    ):
        super().__init__(name, **kwargs)
        self.source = source
        self.hit_dice = hit_dice
        self.save_proficiency = save_proficiency
        self.armor_proficiency = armor_proficiency
        self.weapon_proficiency = weapon_proficiency
        self.tool_proficiency = tool_proficiency
        self.skill_proficiency = skill_proficiency
        self.starting_equipment = starting_equipment
        self.multiclass_requirements = multiclass_requirements
        self.multiclass_armor_proficiency = multiclass_armor_proficiency
        self.multiclass_weapon_proficiency = multiclass_weapon_proficiency
        self.multiclass_tool_proficiency = multiclass_tool_proficiency
        self.multiclass_skill_proficiency = multiclass_skill_proficiency
        self.spellcasting = spellcasting
        self.features = features
        self.subclasses = subclasses
        self.fluff = fluff

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
            get_nested(source_map, f"class.{data.class_file}"),
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

        opt_file = os.path.join(
            plugin.plugin_directory,
            get_nested(source_map, "optionalfeatures"),
        )

        with open(opt_file, "r") as f:
            optional_features = json.load(f)

        features = [
            ClassFeature5e.load(superclass, feat, optional_features)
            for feat in class_raw["classFeatures"]
        ]

        if subclass_raw:
            subclasses = [Subclass5e.load(plugin, source_map, superclass, subclass_raw)]
        else:
            subclasses = (
                [
                    Subclass5e.load(plugin, source_map, superclass, s)
                    for s in superclass["subclass"]
                ]
                if "subclass" in superclass.keys()
                else []
            )

        multiclass_reqs = {}
        if "multiclassing" in class_raw.keys():
            for k, v in class_raw["multiclassing"]["requirements"].items():
                if k == "or":
                    multiclass_reqs["or"] = [
                        {ABILITY_MAP[a]: b for a, b in x.items()} for x in v
                    ]
                else:
                    multiclass_reqs[ABILITY_MAP[k]] = v

        return Class5e(
            name=class_raw["name"],
            source=class_raw["source"],
            hit_dice=f"{class_raw['hd']['number']}d{class_raw['hd']['faces']}",
            save_proficiency=[ABILITY_MAP[p] for p in class_raw["proficiency"]]
            if "proficiency" in class_raw.keys()
            else [],
            armor_proficiency=[
                parse_5etools_string(p if type(p) == str else p["proficiency"])
                for p in class_raw["startingProficiencies"]["armor"]
            ]
            if "startingProficiencies" in class_raw.keys()
            and "armor" in class_raw["startingProficiencies"].keys()
            else [],
            weapon_proficiency=[
                parse_5etools_string(p if type(p) == str else p["proficiency"])
                for p in class_raw["startingProficiencies"]["weapons"]
            ]
            if "startingProficiencies" in class_raw.keys()
            and "weapons" in class_raw["startingProficiencies"].keys()
            else [],
            tool_proficiency=[
                parse_5etools_string(p if type(p) == str else p["proficiency"])
                for p in class_raw["startingProficiencies"]["tools"]
            ]
            if "startingProficiencies" in class_raw.keys()
            and "tools" in class_raw["startingProficiencies"].keys()
            else [],
            skill_proficiency=[
                SkillChoose5e.load(p)
                for p in class_raw["startingProficiencies"]["skills"]
            ]
            if "startingProficiencies" in class_raw.keys()
            and "skills" in class_raw["startingProficiencies"].keys()
            else None,
            starting_equipment=StartingEquipment5e.load(class_raw["startingEquipment"])
            if "startingEquipment" in class_raw.keys()
            else None,
            multiclass_requirements=multiclass_reqs,
            multiclass_armor_proficiency=[
                parse_5etools_string(p if type(p) == str else p["proficiency"])
                for p in class_raw["multiclassing"]["proficienciesGained"]["armor"]
            ]
            if "multiclassing" in class_raw.keys()
            and "proficienciesGained" in class_raw["multiclassing"].keys()
            and "armor" in class_raw["multiclassing"]["proficienciesGained"].keys()
            else [],
            multiclass_weapon_proficiency=[
                parse_5etools_string(p if type(p) == str else p["proficiency"])
                for p in class_raw["multiclassing"]["proficienciesGained"]["weapons"]
            ]
            if "multiclassing" in class_raw.keys()
            and "proficienciesGained" in class_raw["multiclassing"].keys()
            and "weapons" in class_raw["multiclassing"]["proficienciesGained"].keys()
            else [],
            multiclass_tool_proficiency=[
                parse_5etools_string(p if type(p) == str else p["proficiency"])
                for p in class_raw["multiclassing"]["proficienciesGained"]["tools"]
            ]
            if "multiclassing" in class_raw.keys()
            and "proficienciesGained" in class_raw["multiclassing"].keys()
            and "tools" in class_raw["multiclassing"]["proficienciesGained"].keys()
            else [],
            multiclass_skill_proficiency=[
                SkillChoose5e.load(p)
                for p in class_raw["multiclassing"]["proficienciesGained"]["skills"]
            ]
            if "multiclassing" in class_raw.keys()
            and "proficienciesGained" in class_raw["multiclassing"].keys()
            and "skills" in class_raw["multiclassing"]["proficienciesGained"].keys()
            else None,
            spellcasting=Spellcasting5e.load(class_raw),
            features=features,
            subclasses=subclasses,
            fluff=parse_5etools_entries(
                class_raw["fluff"],
                superclass["classFeature"]
                if "classFeature" in superclass.keys()
                else [],
                superclass["subclassFeature"]
                if "subclassFeature" in superclass.keys()
                else [],
                optional_features,
            )
            if "fluff" in class_raw.keys()
            else None,
        )
