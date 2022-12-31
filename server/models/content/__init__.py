import typing
from pymongo.database import Database
from pymongo.collection import Collection

from .content import *
from pydantic import BaseModel


class MinimalContentType(BaseModel):
    oid: str
    owner: str
    shared: dict[str, PERMISSION_TYPE] = {}
    parent: typing.Union[str, typing.Literal["root"]]
    name: str
    image: typing.Union[str, None]
    tags: list[str]
    dataType: str

    @classmethod
    def from_ContentType(cls, content: ContentType):
        return cls(
            oid=content.oid,
            owner=content.owner,
            shared=content.resolved_permissions,
            parent=content.parent,
            name=content.name,
            image=content.image,
            tags=content.tags,
            dataType=content.dataType,
        )
