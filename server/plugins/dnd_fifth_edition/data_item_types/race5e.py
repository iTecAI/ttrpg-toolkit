import os
from typing import Dict, List, Any, Optional
import json
from util.plugin_utils import AbstractDataSourceItem
from util import Plugin
from pydantic import BaseModel
from ..constants import ABILITY_MAP


class AbilityScoreIncreaseItem(AbstractDataSourceItem):
    subtype: str = "race_5e.asi"
    plugin: str = "dnd_fifth_edition"

    def __init__(
        self,
        name: str = None,
        set_values: Dict[str, int] = {},
        choose_count: Dict[int, int] = {},
        choose_options: List[str] = [],
        **kwargs
    ):
        super().__init__(name, **kwargs)
        self.set_values = set_values
        self.choose_count = choose_count
        self.choose_options = choose_options

    @classmethod
    def load(cls, data: Dict[str, Any]):
        set_values = {}
        choose_from = []
        choose_count = {}
        for item in data.keys():
            if item.lower() in ABILITY_MAP.keys():
                set_values[ABILITY_MAP[item.lower()]] = data[item]
            elif item.lower() == "choose":
                choose_from = (
                    [
                        ABILITY_MAP[a.lower()]
                        for a in data["choose"]["from"]
                        if a.lower() in ABILITY_MAP.keys()
                    ]
                    if "from" in data["choose"].keys()
                    else []
                )
                if "count" in data["choose"].keys():
                    if type(data["choose"]["count"]) == dict:
                        choose_count = data["choose"]["count"]
                    elif "amount" in data["choose"].keys():
                        choose_count = {}
                        choose_count[data["choose"]["amount"]] = data["choose"]["count"]
                    else:
                        choose_count = {1: data["choose"]["count"]}
                else:
                    choose_count = {}
                    choose_count[
                        data["choose"]["amount"]
                        if "amount" in data["choose"].keys()
                        else 1
                    ] = 1

        return AbilityScoreIncreaseItem(
            name="ability-inc",
            set_values=set_values,
            choose_count=choose_count,
            choose_options=choose_from,
        )


class MinimalRaceModel(BaseModel):
    name: str
    source: str
    subrace: Optional[str] = None
    subrace_source: Optional[str] = None


class Race5e(AbstractDataSourceItem):
    subtype: str = "race_5e"
    plugin: str = "dnd_fifth_edition"

    def __init__(
        self,
        name: str = None,
        source: str = None,
        ability_scores: List[AbilityScoreIncreaseItem] = None,
        **kwargs
    ):
        super().__init__(name, **kwargs)
        self.source = source
        self.ability_scores = ability_scores

    @staticmethod
    def normalize(race: Dict[str, Any]) -> Dict[str, Any]:
        if not "ability" in race.keys():
            if "lineage" in race.keys():
                if race["lineage"].lower() in ["vrgr", "ua1"]:
                    race["ability"] = [
                        {
                            "choose": {
                                "from": ["str", "dex", "con", "int", "wis", "cha"],
                                "count": {1: 1, 2: 1},
                            }
                        },
                        {
                            "choose": {
                                "from": ["str", "dex", "con", "int", "wis", "cha"],
                                "count": {1: 3},
                            }
                        },
                    ]
                else:
                    race["ability"] = []
            else:
                race["ability"] = []

        race["senses"] = {
            s: race[s]
            for s in ["darkvision", "truesight", "blindsight", "tremorsense"]
            if s in race.keys()
        }

        return race

    @classmethod
    def load(
        cls, plugin: Plugin, source_map: Any, data: MinimalRaceModel
    ) -> List[AbstractDataSourceItem]:
        with open(
            os.path.join(plugin.plugin_directory, source_map["races"]), "r"
        ) as racefile:
            race_data = json.load(racefile)

        found_race = None
        for r in race_data["race"]:
            if (
                r["name"].lower() == data.name.lower()
                and r["source"].lower() == data.source.lower()
            ):
                found_race = Race5e.normalize(r)
                break

        if not found_race:
            return []

        subraces = []
        for s in race_data["subrace"]:
            if (
                s["raceName"].lower() == found_race["name"].lower()
                and s["raceSource"].lower() == found_race["source"].lower()
            ):
                if data.subrace and data.subrace_source:
                    if (
                        data.subrace.lower() == s["name"].lower()
                        and data.subrace_source == s["source"].lower()
                    ):
                        subraces = [Race5e.normalize(s)]
                        break
                subraces.append(Race5e.normalize(s))

        print(json.dumps(subraces, indent=4))
        return []
