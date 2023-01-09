from typing import Any, Dict, TypedDict, Optional

from pydantic import BaseModel
from ..orm import ORM
from ..plugins import Plugin
from urllib.parse import quote
import json


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
        self, source_map: Dict[str, Dict[str, Any] | str], plugin: Plugin, **kwargs
    ) -> None:
        self.source_map = source_map
        self.plugin: Plugin = plugin


class SearchModel(BaseModel):
    fields: Dict[str, str]


def build_data_search_url(plugin: str, category: str, fields: dict[str, Any]) -> str:
    return "/compendium?plugin={plugin}&category={category}&fields={fields}".format(
        plugin=plugin, category=category, fields=quote(json.dumps(fields))
    )


class DataLocator(TypedDict):
    name: str
    plugin: str
    category: str
    search: Optional[dict[str, Any]]
    slug: Optional[str]
