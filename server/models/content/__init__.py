import typing
from pymongo.database import Database
from pymongo.collection import Collection

from .content import *
from pydantic import BaseModel
from models.accounts import User


class MinimalContentType(BaseModel):
    oid: str
    owner: str
    shared: PERMISSION_TYPE
    parent: typing.Union[str, typing.Literal["root"]]
    name: str
    image: typing.Union[str, None]
    tags: list[str]
    dataType: str

    @classmethod
    def from_ContentType(cls, content: ContentType, user: User):
        return cls(
            oid=content.oid,
            owner=content.owner,
            shared=content.permissions_of(user),
            parent=content.parent,
            name=content.name,
            image=content.image,
            tags=content.tags,
            dataType=content.dataType,
        )
