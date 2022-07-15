import json
from typing import List, Optional
from pymongo.collection import Collection
from pymongo.database import Database
import uuid


class ORM:
    object_type: str = "basic"
    collection: str = None
    exclude: Optional[List[str]] = []

    def __init__(self, oid: str = None, database: Database = None, **kwargs):
        self.database = database
        if oid:
            self.oid = oid
        else:
            self.oid = uuid.uuid4().hex

    @property
    def dict(self):
        raw = self.__dict__
        del raw["database"]
        for e in self.exclude:
            if e in raw.keys():
                del raw[e]
        return raw

    def save(self, database: Database = None):
        if database != None:
            collection = database[self.collection]
        elif self.database != None:
            collection = self.database[self.collection]
        else:
            raise ValueError("No database specified")
        collection.replace_one({"oid": self.oid}, self.dict, upsert=True)

    @classmethod
    def from_dict(cls, data: dict, database: Database = None):
        return cls(**data, database=database)

    @classmethod
    def load_oid(cls, oid: str, database: Database):
        data = database[cls.collection].find_one({"oid": oid})
        if not data:
            return None
        return cls.from_dict(data, database=database)

    @classmethod
    def load_multiple_from_query(cls, query: dict, database: Database):
        results = database[cls.collection].find(query)
        return [cls.from_dict(record, database=database) for record in results]


__all__ = ["ORM"]
