from typing import Dict, List, Optional
from util.orm import ORM
from util.plugins import Plugin, PluginLoader
from pymongo.database import Database
import hashlib, base64, time, random


class Game(ORM):
    object_type: str = "game"
    collection: str = "games"
    exclude: Optional[List[str]] = ["plugin_loader", "system_plugin"]

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        owner_id: str = None,
        participants: List[str] = [],
        game_master: str = None,
        name: str = None,
        system: str = None,
        plugins: List[str] = [],
        image: str = "",
        **kwargs
    ):
        super().__init__(oid, database, **kwargs)
        self.name = name
        self.system = system
        self.plugins = plugins
        self.image = image
        self.owner_id = owner_id
        self.game_master = game_master
        self.participants = participants
        self.plugin_loader: PluginLoader = None
        self.system_plugin: Plugin = None

    def set_loader(self, loader: PluginLoader):
        self.plugin_loader = loader
        self.system_plugin = self.plugin_loader[self.system]
        return self

    @classmethod
    def create(
        cls,
        database: Database,
        loader: PluginLoader,
        owner: str,
        name: str,
        system: str,
        plugins: List[str],
    ):
        return cls(
            database=database,
            owner_id=owner,
            name=name,
            system=system,
            plugins=plugins,
            participants=[owner],
            game_master=owner,
        ).set_loader(loader)

    def enumerate_plugins(self) -> Dict[str, Plugin]:
        plugins: Dict[str, Plugin] = {}
        to_check: List[str] = [self.system, *self.plugins]
        new_check: List[str] = []
        while len(to_check) > 0:
            for i in to_check:
                plug: Plugin = self.plugin_loader[i]
                if not i in plugins.keys():
                    plugins[i] = plug
                for d in plug.dependencies:
                    if not d in plugins.keys() and not d in new_check:
                        new_check.append(d)
            to_check = new_check[:]
            new_check = []
        return plugins


class Invite(ORM):
    object_type: str = "invite"
    collection: str = "invites"

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        game_id: str = None,
        code: str = None,
        uses_remaining: int | None = None,
        expiration: int | None = None,
        **kwargs
    ):
        super().__init__(oid, database, **kwargs)
        self.game_id = game_id
        self.code = code
        self.uses_remaining = uses_remaining
        self.expiration = expiration

    @classmethod
    def new(
        cls,
        database: Database,
        game_id: str,
        max_uses: int | None,
        expiration_length: int | None,
    ):
        code = base64.urlsafe_b64encode(
            hashlib.sha256(str(random.random() + time.time()).encode("utf-8"))
            .hexdigest()
            .encode("utf-8")
        ).decode("utf-8")[:8]
        expiration = (time.time() + expiration_length) if expiration_length else None
        return cls(
            database=database,
            game_id=game_id,
            code=code,
            uses_remaining=max_uses,
            expiration=expiration,
        )
