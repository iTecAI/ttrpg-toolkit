from typing import Dict, Optional, Literal, Any
from starlite import Controller, Provide, State, get, post, delete
from util.guards import guard_loggedIn, guard_hasCollectionPermission
from util.dependencies import session_dep, collection_dep
from util.exceptions import (
    CollectionNotFoundError,
    PermissionError,
    InvalidCollectionQuery,
)
from models import (
    Session,
    Collection,
    CollectionObject,
    COLLECTION_SHARE_TYPE,
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
    parents: list[str]
    permissions: COLLECTION_SHARE_TYPE
    name: str
    description: str
    image: str
    tags: list[str]
    children: dict[str, str]

    @classmethod
    def from_collection(cls, collection: Collection, user: User) -> "MinimalCollection":
        return cls(
            collectionId=collection.oid,
            ownerId=collection.owner_id,
            parents=collection.parents,
            permissions=collection.expand_share_array(
                collection.check_permissions(user)
            ),
            name=collection.name,
            description=collection.description,
            image=collection.image,
            tags=collection.tags,
            children=collection.children,
        )


class CreateCollectionModel(BaseModel):
    name: str
    description: Optional[str] = None
    image: Optional[str] = None
    tags: Optional[list[str]] = []
    parent: Optional[str] = "root"


class ConfigureCollectionModel(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    tags: Optional[list[str]] = None


class CollectionShareResultsModel(BaseModel):
    shareType: Literal["user", "game"]
    oid: str
    permissions: list[str]
    name: str
    imageSrc: str


class ShareCollectionModel(BaseModel):
    shareType: Literal["user", "game"]
    oid: str
    permissions: list[str]


class CollectionsController(Controller):
    path = "/collections"
    guards = [guard_loggedIn]
    dependencies: Optional[Dict[str, "Provide"]] = {"session": Provide(session_dep)}

    @get("/")
    async def list_all_visible_collections(
        self, state: State, session: Session, parent: Optional[str] = "root"
    ) -> list[MinimalCollection]:
        user = session.user
        visible = Collection.get_accessible(state.database, user, parent)

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
        collection.delete()
        cluster.dispatch_update(
            {"session": to_update, "update": "collections.update", "data": {}}
        )
        for c in collection.parents:
            if c != "root":
                cluster.dispatch_update(
                    {
                        "session": to_update,
                        "update": "collections.update.children",
                        "data": {"collection": c},
                    }
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
    ) -> list[dict]:
        user = session.user
        children: dict[str, str] = collection.get_accessible_children(user)
        if (
            not "read"
            in collection.expand_share_array(collection.check_permissions(user))
            and len(children) == 0
        ):
            raise CollectionNotFoundError(extra=collection)

        results = []
        for child in children.keys():
            ctype = children[child]
            if ctype == "subcollection":
                coll = MinimalCollection.from_collection(
                    Collection.load_oid(child, state.database), user
                )
                results.append(
                    {
                        "type": "subcollection",
                        "collectionId": coll.collectionId,
                        "parents": coll.parents,
                        "ownerId": coll.ownerId,
                        "permissions": coll.permissions,
                        "name": coll.name,
                        "description": coll.description,
                        "image": coll.image,
                        "tags": coll.tags,
                        "children": coll.children,
                    }
                )

        return results

    @post("/")
    async def create_collection(
        self, state: State, session: Session, data: CreateCollectionModel
    ) -> MinimalCollection:
        user = session.user
        new_collection: Collection = Collection.create(
            state.database,
            user,
            data.parent,
            data.name,
            data.description,
            data.tags,
            data.image,
        )
        new_collection.save()
        cluster: Cluster = state.cluster

        if data.parent and data.parent != "root":
            parent: Collection = Collection.load_oid(data.parent, state.database)
            if parent:
                parent.children[new_collection.oid] = "subcollection"
                parent.save()
                cluster.dispatch_update(
                    {
                        "session": parent.sessions,
                        "update": "collections.update.children",
                        "data": {"collection": parent.oid},
                    }
                )

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

    @post(
        "/{collection_id:str}/share",
        dependencies={"collection": Provide(collection_dep)},
        guards=[guard_hasCollectionPermission("share")],
    )
    async def share_collection(
        self,
        state: State,
        session: Session,
        collection: Collection,
        data: ShareCollectionModel,
    ) -> list[str]:
        user = session.user
        user_perms = collection.expand_share_array(collection.check_permissions(user))
        cluster: Cluster = state.cluster

        for p in data.permissions:
            if p == "owner":
                raise PermissionError()
            if p == "promoter" and not "owner" in user_perms:
                raise PermissionError()
            if p == "admin" and not "promoter" in user_perms:
                raise PermissionError()
            if p == "configure" and not "configure" in user_perms:
                raise PermissionError()

        if data.shareType == "user":
            if len(data.permissions) == 0:
                sessions = collection.sessions
                del collection.shared_users[data.oid]
            else:
                collection.shared_users[data.oid] = data.permissions
                sessions = collection.sessions
        else:
            raise NotImplementedError("GAME SHARING IS TODO")

        cluster.dispatch_update(
            {"session": sessions, "update": "collections.update", "data": {}}
        )

        collection.save()
        return data.permissions

    @post(
        "/{collection_id:str}/configure",
        dependencies={"collection": Provide(collection_dep)},
        guards=[guard_hasCollectionPermission("configure")],
    )
    async def configure_collection(
        self,
        state: State,
        session: Session,
        collection: Collection,
        data: ConfigureCollectionModel,
    ) -> MinimalCollection:
        if data.name:
            collection.name = data.name
        if data.description:
            collection.description = data.description
        if data.image:
            if data.image == "$remove":
                collection.image = ""
            else:
                collection.image = data.image
        if data.tags:
            collection.tags = data.tags
        collection.save()
        state.cluster.dispatch_update(
            {"session": collection.sessions, "update": "collections.update", "data": {}}
        )
        return MinimalCollection.from_collection(collection, session.user)

    @get(
        "/{collection_id:str}/query_result/{kind:str}",
        dependencies={"collection": Provide(collection_dep)},
        guards=[guard_hasCollectionPermission("read")],
    )
    async def query_action_result(
        self, state: State, session: Session, collection: Collection, kind: str
    ) -> list[Any]:
        if kind == "delete":
            results = collection.delete(dry=True)
            to_delete: list[Collection] = Collection.load_multiple_from_query(
                {"oid": {"$in": [r["oid"] for r in results]}}, state.database
            )
            return [t.name for t in to_delete]

        raise InvalidCollectionQuery(extra=kind)
