from util.orm import ORM
from pymongo.database import Database
from typing import Any


class DocumentContentType(ORM):
    object_type = "document"
    collection = "documents"

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        plugin: str = None,
        template: str = None,
        contents: dict[str, Any] = {},
        **kwargs
    ):
        super().__init__(oid, database, **kwargs)
        self.plugin = plugin
        self.template = template
        self.contents = contents

    @classmethod
    def create(
        cls: "DocumentContentType",
        database: Database,
        plugin: str = "",
        template: str = "",
    ) -> "DocumentContentType":
        return cls(database=database, plugin=plugin, template=template)
