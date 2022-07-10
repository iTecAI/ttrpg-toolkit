import json
from pymongo.collection import Collection
from pymongo.database import Database
import uuid

class ORM:
    object_type: str = "basic"
    collection: str = None

    def __init__(self, oid: str = None, **kwargs):
        if oid:
            self.oid = oid
        else:
            self.oid = uuid.uuid4().hex
    
    @property
    def dict(self):
        return self.__dict__
    
    def save(self, database: Database):
        collection = database[self.collection]
        collection.replace_one({"oid": self.oid}, self.dict, upsert=True)
    
    @classmethod
    def from_dict(cls, data: dict):
        return cls(**data)
    
    @classmethod
    def load_oid(cls, oid: str, database: Database):
        return cls.from_dict(database[cls.collection].find_one({"oid": oid}))
    
    @classmethod
    def load_multiple_from_query(cls, query: dict, database: Database):
        results = database[cls.collection].find(query)
        return [cls.from_dict(record) for record in results]
    
__all__ = ["ORM"]
