from util import ORM
from pymongo.database import Database
from .util_types import ModType


class AbstractCharacter(ORM):
    collection = "characters"
    object_type = "character"
    plugin: str = None
    character_type: str = None
    include = ["plugin", "character_type"]

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        mods: list[ModType] = [],
        **kwargs
    ):
        if not self.plugin or not self.character_type:
            raise RuntimeError(".plugin and .character_type must be defined")
        self.mods = mods
        super().__init__(oid, database, **kwargs)
