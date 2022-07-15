from typing import List, Optional
from util.orm import ORM
from util.plugins import Plugin, PluginLoader
from pymongo.database import Database


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
        self.plugin_loader: PluginLoader = None
        self.system_plugin: Plugin = None
        self.owner_id = owner_id
        self.participants = participants

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
            database=database, owner_id=owner, name=name, system=system, plugins=plugins
        ).set_loader(loader)
