import json
from pymongo.collection import Collection
from pymongo.database import Database
import uuid


class ORM:
    object_type: str = "basic"
    collection: str = None

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
        return cls.from_dict(
            database[cls.collection].find_one({"oid": oid}), database=database
        )

    @classmethod
    def load_multiple_from_query(cls, query: dict, database: Database):
        results = database[cls.collection].find(query)
        return [cls.from_dict(record, database=database) for record in results]


__all__ = ["ORM"]
