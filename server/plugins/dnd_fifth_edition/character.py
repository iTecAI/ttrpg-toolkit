import math
from util.plugin_utils import *
from pymongo.database import Database
from util.orm import ORM
from util.exceptions import BaseHTTPException
from starlette.status import *
from .constants import ABILITIES


class AbilityScoreException(BaseHTTPException):
    message: str = "Ability score not recognized"
    message_class: str = "errors.plugin.dnd_fifth_edition.character.ability_score"
    status_code: int = HTTP_404_NOT_FOUND


class AbilityScores(ORM):
    object_type: str = "5e_sheet_item"
    subtype: str = "ability_scores"

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        strength: int = 10,
        dexterity: int = 10,
        constitution: int = 10,
        intelligence: int = 10,
        wisdom: int = 10,
        charisma: int = 10,
        **kwargs
    ):
        super().__init__(oid, database, **kwargs)
        self.strength = strength
        self.dexterity = dexterity
        self.constitution = constitution
        self.intelligence = intelligence
        self.wisdom = wisdom
        self.charisma = charisma

    def modifier(self, ability: str):
        if not ability in ABILITIES:
            raise AbilityScoreException
        return math.floor((getattr(self, ability) - 10) / 2)

    @property
    def strength_modifier(self):
        return self.modifier("strength")

    @property
    def dexterity_modifier(self):
        return self.modifier("dexterity")

    @property
    def constitution_modifier(self):
        return self.modifier("constitution")

    @property
    def intelligence_modifier(self):
        return self.modifier("intelligence")

    @property
    def wisdom_modifier(self):
        return self.modifier("wisdom")

    @property
    def charisma_modifier(self):
        return self.modifier("charisma")


class Character5e(AbstractCharacter):
    subtype: str = "5e"

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        game_id: str = None,
        owner_id: str = None,
        name: str = None,
        avatar: str = None,
        **kwargs
    ):
        super().__init__(oid, database, game_id, owner_id, name, avatar, **kwargs)
