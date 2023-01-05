import typing
from pymongo.database import Database
from pymongo.collection import Collection

from .content import *
from pydantic import BaseModel
from models.accounts import User
from util.orm import ORM


class MinimalContentType(BaseModel):
    oid: str
    owner: str
    shared: PERMISSION_TYPE
    parent: typing.Union[str, typing.Literal["root"]]
    name: str
    image: typing.Union[str, None]
    tags: list[str]
    dataType: str
    data: typing.Optional[str] = None

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
            data=content.data,
        )


class ExpandedContentType(BaseModel):
    oid: str
    owner: str
    shared: PERMISSION_TYPE
    parent: typing.Union[str, typing.Literal["root"]]
    name: str
    image: typing.Union[str, None]
    tags: list[str]
    dataType: str
    data: typing.Optional[dict] = None

    @classmethod
    def from_ContentType(cls, content: ContentType, user: User):
        if (
            content.data
            and content.dataType
            and content.dataType in content.type_map.keys()
        ):
            creator: ORM = content.type_map[content.dataType]
            if creator:
                out = creator.load_oid(content.data, user.database)
                if out:
                    data = out.dict
                else:
                    data = None
            else:
                data = None
        else:
            data = None
        return cls(
            oid=content.oid,
            owner=content.owner,
            shared=content.permissions_of(user),
            parent=content.parent,
            name=content.name,
            image=content.image,
            tags=content.tags,
            dataType=content.dataType,
            data=data,
        )


class ContentSearchResult(BaseModel):
    oid: str
    name: str
    image: Union[str, None]
    dataType: str

    @classmethod
    def from_ContentType(cls, content: ContentType):
        return ContentSearchResult(
            oid=content.oid,
            name=content.name,
            image=content.image,
            dataType=content.dataType,
        )
