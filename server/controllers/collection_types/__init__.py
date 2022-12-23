from typing import Dict, Optional
from starlite import Controller, Provide, State, get, post
from util.guards import guard_loggedIn
from util.dependencies import session_dep, collection_dep
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
    subtype: str
    collectionId: str
    ownerId: str
    permissions: ITEM_SHARE_TYPE
    name: str
    description: str
    image: str

    @classmethod
    def from_collection_object(
        cls, obj: CollectionObject, user: User
    ) -> "MinimalCollectionObject":
        return cls(
            obj.subtype,
            obj.oid,
            obj.owner_id,
            obj.expand_share_array(obj.check_permissions(user)),
            obj.name,
            obj.description,
            obj.image,
        )


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

    @get("/{collection_id:str}", dependencies={"collection": Provide(collection_dep)})
    async def get_specific_collection(
        self, state: State, session: Session, collection: Collection
    ) -> MinimalCollection:
        user = session.user
        if not "read" in collection.expand_share_array(
            collection.check_permissions(user)
        ):
            raise CollectionNotFoundError(extra=collection)

        return MinimalCollection.from_collection(collection, user)

    @get(
        "/{collection_id:str}/children",
        dependencies={"collection": Provide(collection_dep)},
    )
    async def get_collection_children(
        self,
        state: State,
        session: Session,
        collection: Collection,
        subtype: Optional[str] = None,
    ) -> list[MinimalCollectionObject]:
        user = session.user
        children = collection.get_accessible_children(user)
        if (
            not "read"
            in collection.expand_share_array(collection.check_permissions(user))
            and len(children) == 0
        ):
            raise CollectionNotFoundError(extra=collection)

        results_unfiltered = [
            MinimalCollectionObject.from_collection_object(c) for c in children
        ]
        return [
            r for r in results_unfiltered if subtype != None and subtype == r.subtype
        ]
