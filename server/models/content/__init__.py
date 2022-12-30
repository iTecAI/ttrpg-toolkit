import typing
from pymongo.database import Database
from pymongo.collection import Collection

from .content import (
    BaseContentType,
    PERMISSION_TYPE,
    PERMISSION_TYPE_KEY,
    PERMISSION_VALUE,
)
from .folder import FolderContentType, MinimalFolderModel

CONTENT_TYPE = typing.Union[FolderContentType, None]
MINIMAL_CONTENT_TYPE = typing.Union[MinimalFolderModel, None]
CONTENT_TYPE_MAP = {"folder": FolderContentType}


def load_generic_content_from_query(
    query: dict, database: Database
) -> list[CONTENT_TYPE]:
    collection: Collection = database[BaseContentType.collection]
    raw_result = collection.find(query)
    results = []
    for r in raw_result:
        initiator: CONTENT_TYPE = CONTENT_TYPE_MAP[r["subtype"]]
        results.append(initiator.from_dict(r, database))
    return results


def load_generic_content(oid: str, database: Database) -> CONTENT_TYPE:
    result = load_generic_content_from_query({"oid": oid})
    if len(result) == 0:
        return None
    return result[0]
