import importlib
import json
from typing import Dict, List, Optional
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
    def dict(self):  # Good for storing on-db
        raw = self.__dict__
        del raw["database"]
        for e in self.exclude:
            if e in raw.keys():
                del raw[e]
        for k, v in raw.items():
            if isinstance(v, ORM):
                raw[k] = {
                    "$ORMTYPE": v.__name__,
                    "$ORMMODULE": v.__module__,
                    "$ORMDATA": v.dict,
                }
        return raw

    @staticmethod
    def parse_dict_raw(data: Dict):
        result = {}
        for k, v in data.items():
            if isinstance(v, ORM):
                result[k] = v.raw
            elif type(v) == dict:
                result[k] = ORM.parse_dict_raw(v)
            elif type(v) == list:
                result[k] = ORM.parse_list_raw(v)
            else:
                result[k] = v
        return result

    @staticmethod
    def parse_list_raw(data: List):
        result = []
        for i in data:
            if isinstance(i, ORM):
                result.append(i.raw)
            elif type(i) == dict:
                result.append(ORM.parse_dict_raw(i))
            elif type(i) == list:
                result.append(ORM.parse_list_raw(i))
            else:
                result.append(i)
        return result

    @property
    def raw(self):  # Good for sending to client
        raw = self.__dict__
        del raw["database"]
        for e in self.exclude:
            if e in raw.keys():
                del raw[e]
        raw = ORM.parse_dict_raw(raw)
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
    def from_dict(cls, data: Dict, database: Database = None):
        for k, v in data.items():
            if type(v) == dict:
                if (
                    "$ORMTYPE" in v.keys()
                    and "$ORMDATA" in v.keys()
                    and "$ORMMODULE" in v.keys()
                ):
                    try:
                        _module = importlib.import_module(".", v["$ORMMODULE"])
                        _obj: ORM = getattr(_module, v["$ORMTYPE"])
                        data[k] = _obj.from_dict(v["$ORMDATA"], database=Database)
                    except:
                        pass
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
