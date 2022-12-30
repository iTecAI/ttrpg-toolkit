from .content import BaseContentType, PERMISSION_TYPE
from pymongo.database import Database
from typing import Union, Literal
from pydantic import BaseModel


class MinimalFolderModel(BaseModel):
    contentType: Literal["folder"]
    oid: str
    owner: str
    shared: dict[str, PERMISSION_TYPE]
    parent: Union[str, Literal["root"]]
    name: str
    image: Union[str, None]
    tags: list[str]
    children: list[str]


class FolderContentType(BaseContentType):
    subtype = "folder"

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        owner: str = None,
        shared: dict[str, PERMISSION_TYPE] = {},
        parent: Union[str, Literal["root"]] = None,
        name: str = None,
        image: Union[str, None] = None,
        tags: list[str] = [],
        children: list[str] = [],
        **kwargs
    ):
        super().__init__(
            oid, database, owner, shared, parent, name, image, tags, **kwargs
        )
        self.children = children

    @property
    def minimize(self) -> MinimalFolderModel:
        return MinimalFolderModel(
            contentType="folder",
            oid=self.oid,
            owner=self.owner,
            shared=self.shared,
            parent=self.parent,
            name=self.name,
            image=self.image,
            tags=self.tags,
            children=self.children,
        )
