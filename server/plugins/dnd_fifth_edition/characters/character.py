from util.plugin_utils import AbstractCharacter, ModType
from pymongo.database import Database
from typing import TypedDict, Literal, Optional


class LevelMode(TypedDict):
    mode: Literal["xp", "milestone"]
    experience: Optional[int]
    level: Optional[int]


class RaceLocator(TypedDict):
    name: str
    source: str
    subrace: Optional[str]
    subrace_source: Optional[str]


class ClassLocator(TypedDict):
    name: str
    source: str
    subclass: Optional[str]
    subclass_source: Optional[str]


class AbilityScore(TypedDict):
    base: int
    modifier: int
    save_proficient: bool


class AbilityScores(TypedDict):
    strength: AbilityScore
    dexterity: AbilityScore
    constitution: AbilityScore
    intelligence: AbilityScore
    wisdom: AbilityScore
    charisma: AbilityScore


PROFICIENCY = Optional[Literal[0, 1, 2]]


class SkillProficiencies(TypedDict):
    acrobatics: PROFICIENCY
    animal_handling: PROFICIENCY
    arcana: PROFICIENCY
    athletics: PROFICIENCY
    deception: PROFICIENCY
    history: PROFICIENCY
    insight: PROFICIENCY
    intimidation: PROFICIENCY
    investigation: PROFICIENCY
    medicine: PROFICIENCY
    nature: PROFICIENCY
    perception: PROFICIENCY
    performance: PROFICIENCY
    persuasion: PROFICIENCY
    religion: PROFICIENCY
    sleight_of_hand: PROFICIENCY
    stealth: PROFICIENCY
    survival: PROFICIENCY


PROF_OBJECT_TYPE = Literal["armor", "weapon", "vehicle", "tool", "other"]


class ObjectProficiency(TypedDict):
    type: PROF_OBJECT_TYPE
    name: str
    proficiency: PROFICIENCY


class HitPoints(TypedDict):
    current: int
    max: int
    temp: Optional[int]


class BaseCharacter5e(AbstractCharacter):
    plugin = "dnd_fifth_edition"
    character_type = "base"

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        mods: list[ModType] = [],
        player_name: str = "",
        level: LevelMode = {"mode": "xp", "experience": 0},
        race: RaceLocator = {"name": "Human", "source": "PHB"},
        character_class: ClassLocator = {"name": "Fighter", "source": "PHB"},
        ability_scores: AbilityScores = {
            "strength": {"base": 10, "modifier": 0, "save_proficient": False},
            "dexterity": {"base": 10, "modifier": 0, "save_proficient": False},
            "constitution": {"base": 10, "modifier": 0, "save_proficient": False},
            "intelligence": {"base": 10, "modifier": 0, "save_proficient": False},
            "wisdom": {"base": 10, "modifier": 0, "save_proficient": False},
            "charisma": {"base": 10, "modifier": 0, "save_proficient": False},
        },
        skills: SkillProficiencies = {},
        proficiencies: list[ObjectProficiency] = [],
        inspiration: bool = False,
        hit_points: HitPoints = {"current": 0, "max": 0},
        languages: list[str] = [],
        **kwargs
    ):
        super().__init__(oid, database, mods=mods**kwargs)
        self.player_name = player_name
        self.level = level
        self.race = race
        self.character_class = character_class
        self.ability_scores = ability_scores
        self.skills = skills
        self.proficiencies = proficiencies
        self.inspiration = inspiration
        self.hit_points = hit_points
        self.languages = languages
