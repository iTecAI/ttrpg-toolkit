from starlite import Controller, Provide, get, post, State, delete
from util import (
    guard_loggedIn,
    session_dep,
    Cluster,
    Session,
    guard_hasContentPermission,
)
from util.exceptions import (
    InvalidContentTypeError,
    InvalidContentArgumentsError,
    ContentItemNotFoundError,
)
from models import ContentType, MinimalContentType
from typing import Optional
import json
from pydantic import BaseModel
from typing import Union, Optional


class ContentCreateModel(BaseModel):
    name: str
    image: Optional[Union[str, None]] = None
    tags: Optional[list[str]] = []
    data: Optional[dict] = {}


class ContentRootController(Controller):
    path = "/content"
    dependencies = {"session": Provide(session_dep)}
    guards = [guard_loggedIn]

    @post("/{content_type:str}")
    async def create_content(
        self,
        state: State,
        session: Session,
        content_type: str,
        data: ContentCreateModel,
        parent: Optional[str] = "root",
    ) -> MinimalContentType:
        if not content_type in ContentType.type_map.keys():
            raise InvalidContentTypeError(extra=content_type)
        try:
            new = ContentType.create(
                state.database,
                session.user,
                parent,
                name=data.name,
                image=data.image,
                tags=data.tags,
                dataType=content_type,
            )
        except:
            raise InvalidContentArgumentsError(extra=json.dumps(data))

        cluster: Cluster = state.cluster
        new.save()

        if parent != "root":
            parent_obj = ContentType.load_oid(parent, state.database)
            if parent_obj == None:
                raise ContentItemNotFoundError(extra=f"[parent] {parent}")

            parent_obj.children.append(new.oid)
            parent_obj.save()
            cluster.dispatch_update(
                parent_obj.sessions_with("view"),
                f"content.update.{parent}",
                data={"type": "addChild"},
            )

        else:
            s_to_u = new.sessions_with("view")
            cluster.dispatch_update(
                s_to_u,
                f"content.update.root",
                data={"type": "addChild"},
            )

        cluster.dispatch_update(new.sessions_with("view"), "content.create")

        return MinimalContentType.from_ContentType(new, session.user)

    @get("/{parent:str}")
    async def get_children(
        self, state: State, session: Session, parent: str
    ) -> list[MinimalContentType]:
        if parent == "root":
            parent_id = "root"
        else:
            parent_obj: ContentType = ContentType.load_oid(parent, state.database)
            if parent_obj == None:
                raise ContentItemNotFoundError(extra=f"[parent] {parent}")
            parent_id = parent

        children: list[str] = ContentType.get_with_permission(
            state.database, parent_id, session.user, "read"
        )
        user = session.user
        return [
            MinimalContentType.from_ContentType(i, user)
            for i in ContentType.load_multiple_from_query(
                {"oid": {"$in": children}}, state.database
            )
        ]

    @delete("/{content_id:str}", guards=[guard_hasContentPermission("delete")])
    async def delete_child(self, state: State, content_id: str) -> None:
        loaded = ContentType.load_oid(content_id, state.database)
        if loaded == None:
            raise ContentItemNotFoundError(extra=content_id)

        to_update = loaded.sessions_with("view")
        loaded.delete(state.user_content)
        cluster: Cluster = state.cluster
        if loaded.parent == "root":
            cluster.dispatch_update(
                to_update,
                f"content.update.root",
                data={"type": "delete"},
            )
        else:
            parent = ContentType.load_oid(loaded.parent)
            if parent:
                cluster.dispatch_update(
                    to_update,
                    f"content.update.{loaded.parent}",
                    data={"type": "delete"},
                )

    @get(
        "/query_delete/{content_id:str}", guards=[guard_hasContentPermission("delete")]
    )
    async def get_delete_child(
        self, state: State, session: Session, content_id: str
    ) -> list[MinimalContentType]:
        loaded = ContentType.load_oid(content_id, state.database)
        if loaded == None:
            raise ContentItemNotFoundError(extra=content_id)

        to_delete = loaded.delete(state.user_content, dry_run=True)
        user = session.user
        return [
            MinimalContentType.from_ContentType(i, user)
            for i in ContentType.load_multiple_from_query(
                {"oid": {"$in": to_delete}}, state.database
            )
        ]
