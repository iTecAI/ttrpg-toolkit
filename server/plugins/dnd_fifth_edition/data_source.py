from util.plugin_utils import AbstractDataSourceLoader, SearchModel
from util.plugins import Plugin
from util.exceptions import (
    PluginDataArgumentError,
)
import util
from typing import Dict, Any, List
import json
import os
from plugins.dnd_fifth_edition.data_item_types.class5e import (
    Class5e,
    MinimalClassDescriptor,
)


class DataLoader5e(AbstractDataSourceLoader):
    def __init__(
        self, source_map: Dict[str, Dict[str, Any] | str], plugin: Plugin, **kwargs
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

    def search_classes(self, search: SearchModel) -> List[MinimalClassDescriptor]:
        results = []
        if "class" in search.fields.keys():
            class_file_possibilities = util.search(
                search.fields["class"],
                [i for i in self.source_map["class"].keys() if i.startswith("class-")],
                getitem=lambda x: x.split("-", maxsplit=1)[1],
            )
        else:
            class_file_possibilities = [
                i for i in self.source_map["class"].keys() if i.startswith("class-")
            ]

        for cfp in class_file_possibilities:
            print(self.source_map["class"][cfp], self.plugin.plugin_directory)
            with open(
                os.path.join(
                    self.plugin.plugin_directory, self.source_map["class"][cfp]
                ),
                "r",
            ) as f:
                classes = json.load(f)

            if "class" in search.fields.keys():
                search_classes = util.search(
                    search.fields["class"],
                    classes["class"],
                    getitem=lambda x: x["name"],
                )

                results.extend(
                    [
                        MinimalClassDescriptor(
                            class_name=c["name"],
                            source_name=c["source"],
                            subclass_name=None,
                        )
                        for c in search_classes
                    ]
                )
        return results
