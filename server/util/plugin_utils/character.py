from ..orm import ORM
from pymongo.database import Database
from typing import Optional, List
from models.games import Game
from models.accounts import User


class AbstractCharacter(ORM):
    object_type: str = "character"
    subtype: str = "base"
    collection: str = "characters"
    exclude: Optional[List[str]] = ["game_object"]

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
        super().__init__(oid, database, **kwargs)
        self.game_id = game_id
        self.owner_id = owner_id
        self.name = name
        self.avatar = avatar

    @property
    def game(self) -> Game:
        return Game.load_oid(self.game_id, self.database)

    @property
    def owner(self) -> User:
        return User.load_oid(self.owner_id, self.database)
