from typing import Dict, Optional
from starlite import Controller, Provide, State, get, post
from util.guards import guard_loggedIn
from util.dependencies import session_dep
from util.exceptions import CollectionNotFoundError
from models import (
    Session,
    Collection,
    CollectionObject,
    COLLECTION_SHARE_TYPE,
    ITEM_SHARE_TYPE,
    User,
)
from pydantic import BaseModel


class MinimalCollection(BaseModel):
    collectionId: str
    ownerId: str
    permissions: COLLECTION_SHARE_TYPE
    name: str
    description: str
    image: str
    children: list[str]

    @classmethod
    def from_collection(cls, collection: Collection, user: User) -> "MinimalCollection":
        return cls(
            collection.oid,
            collection.owner_id,
            collection.expand_share_array(collection.check_permissions(user)),
            collection.name,
            collection.description,
            collection.image,
            collection.children_ids,
        )


class MinimalCollectionObject(BaseModel):
    collectionId: str
    ownerId: str
    permissions: ITEM_SHARE_TYPE
    name: str
    description: str
    image: str


class CollectionsController(Controller):
    guards = [guard_loggedIn]
    dependencies: Optional[Dict[str, "Provide"]] = {"session": Provide(session_dep)}

    @get("/")
    async def list_all_visible_collections(
        self, state: State, session: Session
    ) -> list[MinimalCollection]:
        user = session.user
        visible = Collection.get_accessible(state.database, user)

        return [MinimalCollection.from_collection(v, user) for v in visible]

    @get("/{collection:str}")
    async def get_specific_collection(
        self, state: State, session: Session, collection: str
    ) -> MinimalCollection:
        user = session.user
        result = Collection.load_oid(collection, state.database)
        if result == None:
            raise CollectionNotFoundError(extra=collection)
        if not "read" in result.expand_share_array(result.check_permissions(user)):
            raise CollectionNotFoundError(extra=collection)

        return MinimalCollection.from_collection(result, user)
