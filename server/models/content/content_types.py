import typing
from .folder import FolderContentType, MinimalFolderModel
from pymongo.database import Database
from pymongo.collection import Collection

CONTENT_TYPE = typing.Union[FolderContentType, None]
MINIMAL_CONTENT_TYPE = typing.Union[MinimalFolderModel, None]
CONTENT_TYPE_MAP = {"folder": FolderContentType}


def load_generic_content_from_query(
    query: dict, database: Database
) -> list[CONTENT_TYPE]:
    collection: Collection = database[CONTENT_TYPE.collection]
    raw_result = [i for i in collection.find(query)]
    results = []
    for r in raw_result:
        initiator: CONTENT_TYPE = CONTENT_TYPE_MAP[r["subtype"]]
        results.append(initiator.from_dict(r, database))
    return results


def load_generic_content(oid: str, database: Database) -> CONTENT_TYPE:
    result = load_generic_content_from_query({"oid": oid}, database)
    if len(result) == 0:
        return None
    return result[0]
