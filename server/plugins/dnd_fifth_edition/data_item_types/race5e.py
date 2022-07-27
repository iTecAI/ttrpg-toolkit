import os
from typing import Dict, List, Any, Optional
import json
from util.plugin_utils import AbstractDataSourceItem
from util import Plugin
from pydantic import BaseModel
from ..constants import ABILITY_MAP


class AbilityScoreIncreateItem(AbstractDataSourceItem):
    subtype: str = "race_5e.asi"
    plugin: str = "dnd_fifth_edition"

    def __init__(
        self,
        name: str = None,
        set_values: Dict[str, int] = {},
        choose_count: int = 0,
        choose_options: List[str] = [],
        choose_increase: int = 1,
        **kwargs
    ):
        super().__init__(name, **kwargs)
        self.set_values = set_values
        self.choose_count = choose_count
        self.choose_increase = choose_increase
        self.choose_options = choose_options

    @classmethod
    def load(cls, data: Dict[str, Any]):
        set_values = {}
        choose_from = []
        choose_count = 0
        choose_increase = 1
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
                choose_count = (
                    data["choose"]["count"] if "count" in data["choose"].keys() else 0
                )
                choose_increase = (
                    data["choose"]["amount"] if "amount" in data["choose"].keys() else 1
                )

        return AbilityScoreIncreateItem(
            name="ability-inc",
            set_values=set_values,
            choose_count=choose_count,
            choose_options=choose_from,
            choose_increase=choose_increase,
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
        base: bool = False,
        ability_scores: AbilityScoreIncreateItem = None,
        **kwargs
    ):
        super().__init__(name, **kwargs)
        self.source = source
        self.base = base
        self.ability_scores = ability_scores

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
                found_race = r
                break

        if not found_race:
            return []

        subraces = [found_race]
        for s in race_data["subrace"]:
            if (
                s["raceName"].lower() == found_race["name"].lower()
                and s["raceSource"] == found_race["source"].lower()
            ):
                if data.subrace and data.subrace_source:
                    if (
                        data.subrace.lower() == s["name"].lower()
                        and data.subrace_source == s["source"].lower()
                    ):
                        subraces = [s]
                        break
                subraces.append(s)

        print(subraces)
        return []
