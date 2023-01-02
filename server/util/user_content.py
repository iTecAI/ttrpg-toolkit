from .config import Config
from models.accounts import User
from typing import Literal
from pymongo.database import Database
from pymongo.collection import Collection
from starlite.datastructures import UploadFile, Stream
import uuid
import time
import os
from collections.abc import AsyncGenerator

CONTENT_MODE = Literal["local"]


class GenericContentManager:
    CHUNKSIZE = 16384  # Chunk size in bytes
    COLLECTION = "user_content"

    def __init__(self, config: Config, database: Database):
        self.user_content_config = config["user_content"]
        self.mode: CONTENT_MODE = self.user_content_config["mode"]
        self.database: Database = database
        self.collection: Collection = self.database[self.COLLECTION]

    def generate_metadata(self, file: UploadFile, user: User) -> dict:
        new_id = uuid.uuid4().hex + "-" + user.oid
        return {
            "id": new_id,
            "filename": f"{new_id}.{file.filename}",
            "uploader": user.oid,
            "upload_time": time.time(),
            "upload_time_ctime": time.ctime(),
            "mode": self.mode,
            "content_type": file.content_type,
        }

    def save_meta(self, metadata: dict):
        self.collection.insert_one(metadata)

    def save(self, file: UploadFile, user: User) -> str:
        raise NotImplementedError("CANNOT SAVE TO GENERIC MANAGER")

    def load_meta(self, meta: dict) -> Stream:
        raise NotImplementedError("CANNOT LOAD FROM GENERIC MANAGER")

    def load(self, oid: str) -> Stream:
        result = self.collection.find_one({"id": oid})
        if result == None:
            raise KeyError(f"ID {oid} not found")
        return self.load_meta(result)

    def clear_id(self, oid: str):
        self.collection.delete_one({"id": oid})

    def delete(self, oid: str):
        result = self.collection.find_one({"id": oid})
        if result == None:
            raise KeyError(f"ID {oid} not found")
        return self.delete_meta(result)

    def delete_meta(self, meta: dict):
        raise NotImplementedError("CANNOT DELETE FROM GENERIC MANAGER")


class LocalContentManager(GenericContentManager):
    def __init__(self, config: Config, database: Database):
        super().__init__(config, database)
        self.path = self.user_content_config["path"]

    async def save(self, file: UploadFile, user: User) -> str:
        metadata = self.generate_metadata(file, user)
        with open(os.path.join(self.path, metadata["filename"]), "wb") as f:
            while True:
                data = await file.read(self.CHUNKSIZE)
                if len(data) == 0:
                    break
                f.write(data)
        self.save_meta(metadata)
        return metadata["id"]

    def load_meta(self, meta: dict) -> Stream:
        if not os.path.exists(os.path.join(self.path, meta["filename"])):
            self.clear_id(meta["id"])
            raise KeyError(f"ID {meta['id']} not found")

        async def generate_stream() -> AsyncGenerator[bytes, None]:
            with open(os.path.join(self.path, meta["filename"]), "rb") as f:
                while True:
                    data = f.read(self.CHUNKSIZE)
                    if len(data) == 0:
                        break
                    yield data

        return Stream(iterator=generate_stream, media_type=meta["content_type"])

    def delete_meta(self, meta: dict):
        if os.path.exists(os.path.join(self.path, meta["filename"])):
            os.remove(os.path.join(self.path, meta["filename"]))
        self.clear_id(meta["id"])
