from util.plugin_utils import AbstractDataSourceLoader
from util.plugins import Plugin
from util.exceptions import (
    PluginDataArgumentError,
)
from typing import Dict, Any
import json
from .data_item_types.class5e import Class5e, MinimalClassDescriptor


class DataLoader5e(AbstractDataSourceLoader):
    def __init__(
        self, source_map: Dict[str, Dict[str, Any] | str], plugin: Plugin, *kwargs
    ) -> None:
        super().__init__(source_map, plugin, *kwargs)

    def get_class(self, model: MinimalClassDescriptor | Dict[str, Any]) -> Class5e:
        if type(model) == dict:
            try:
                model = MinimalClassDescriptor(**model)
            except:
                raise PluginDataArgumentError(
                    extra=f"Model {json.dumps(model)} is invalid."
                )

        return Class5e.load(self.plugin, self.source_map, model)
