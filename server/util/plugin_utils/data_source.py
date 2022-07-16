from typing import Any, Dict

from pydantic import BaseModel
from ..orm import ORM
from ..plugins import Plugin


class AbstractDataSourceItem(ORM):
    object_type: str = "data_source_item"
    subtype: str = "base"
    plugin: str = "base"

    def __init__(self, name: str = None, **kwargs):
        super().__init__(name, None, **kwargs)
        self.name = name

    @classmethod
    def load(cls, plugin: Plugin, source_map: Any, data: BaseModel):
        raise NotImplementedError("Cannot load abstract DataSourceItem")


class AbstractDataSourceLoader:
    def __init__(
        self, source_map: Dict[str, Dict[str, Any] | str], plugin: Plugin, *kwargs
    ) -> None:
        self.source_map = source_map
        self.plugin: Plugin = plugin
