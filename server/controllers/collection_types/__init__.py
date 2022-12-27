from typing import Dict, Optional, Literal
from starlite import Controller, Provide, State, get, post, delete
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
    Game,
)
from pydantic import BaseModel
from util import Cluster, GenericContentManager
from starlette.status import *
from pymongo.collection import Collection as MongoCollection


class MinimalCollection(BaseModel):
    collectionId: str
    ownerId: str
    permissions: COLLECTION_SHARE_TYPE
    name: str
    description: str
    image: str
    tags: list[str]
    children: list[str]

    @classmethod
    def from_collection(cls, collection: Collection, user: User) -> "MinimalCollection":
        return cls(
            collectionId=collection.oid,
            ownerId=collection.owner_id,
            permissions=collection.expand_share_array(
                collection.check_permissions(user)
            ),
            name=collection.name,
            description=collection.description,
            image=collection.image,
            tags=collection.tags,
            children=collection.children_ids,
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
            subtype=obj.subtype,
            collectionId=obj.oid,
            ownerId=obj.owner_id,
            permissions=obj.expand_share_array(obj.check_permissions(user)),
            name=obj.name,
            description=obj.description,
            image=obj.image,
        )


class CreateCollectionModel(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    tags: Optional[list[str]] = []


class CollectionShareResultsModel(BaseModel):
    shareType: Literal["user", "game"]
    oid: str
    permissions: list[str]
    name: str
    imageSrc: str


class CollectionsController(Controller):
    path = "/collections"
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

    @delete(
        "/{collection_id:str}",
        dependencies={"collection": Provide(collection_dep)},
        status_code=HTTP_204_NO_CONTENT,
    )
    async def delete_collection(
        self, state: State, session: Session, collection: Collection
    ) -> None:
        permissions = collection.expand_share_array(
            collection.check_permissions(session.user)
        )
        if not "admin" in permissions:
            raise PermissionError()

        to_update = collection.sessions
        manager: GenericContentManager = state.user_content
        if collection.image != "":
            manager.delete(collection.image.split("/")[3])
        cluster: Cluster = state.cluster
        ccol: MongoCollection = state.database[Collection.collection]
        ccol.delete_one({"oid": collection.oid})
        cluster.dispatch_update(
            {"session": to_update, "update": "collections.update", "data": {}}
        )

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
            MinimalCollectionObject.from_collection_object(c, user) for c in children
        ]
        return [
            r for r in results_unfiltered if subtype != None and subtype == r.subtype
        ]

    @post("/")
    async def create_collection(
        self, state: State, session: Session, data: CreateCollectionModel
    ) -> MinimalCollection:
        user = session.user
        new_collection: Collection = Collection.create(
            state.database,
            user,
            data.name,
            data.description,
            data.tags,
            data.image,
        )
        new_collection.save()

        cluster: Cluster = state.cluster
        cluster.dispatch_update(
            {"session": session.oid, "update": "collections.update", "data": {}}
        )

        return MinimalCollection.from_collection(new_collection, user)

    @get(
        "/{collection_id:str}/shared",
        dependencies={"collection": Provide(collection_dep)},
    )
    async def get_shared_ids(
        self, state: State, collection: Collection
    ) -> list[CollectionShareResultsModel]:
        users: list[User] = User.load_multiple_from_query(
            {"oid": {"$in": list(collection.shared_users.keys())}}, state.database
        )
        games: list[Game] = Game.load_multiple_from_query(
            {"oid": {"$in": list(collection.shared_games.keys())}}, state.database
        )
        owner: User = User.load_oid(collection.owner_id, state.database)

        results: list[CollectionShareResultsModel] = []
        if owner:
            results.append(
                CollectionShareResultsModel(
                    shareType="user",
                    oid=owner.oid,
                    permissions=["owner"],
                    name=owner.display_name,
                    imageSrc=owner.username,
                )
            )
        for u in users:
            results.append(
                CollectionShareResultsModel(
                    shareType="user",
                    oid=u.oid,
                    permissions=collection.shared_users[u.oid],
                    name=u.display_name,
                    imageSrc=u.username,
                )
            )

        for g in games:
            results.append(
                CollectionShareResultsModel(
                    shareType="game",
                    oid=g.oid,
                    permissions=collection.shared_games[g.oid],
                    name=g.name,
                    imageSrc=g.image,
                )
            )
        return results
