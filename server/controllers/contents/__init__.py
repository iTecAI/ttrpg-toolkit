from starlite import Controller, Provide, get, post, State, delete
from util import (
    guard_loggedIn,
    session_dep,
    content_dep,
    Cluster,
    Session,
    guard_hasContentPermission,
    GenericContentManager,
)
from util.exceptions import (
    InvalidContentTypeError,
    InvalidContentArgumentsError,
    ContentItemNotFoundError,
    InvalidContentSettingError,
    PermissionError,
    UserDoesNotExistError,
)
from models import (
    ContentType,
    MinimalContentType,
    PERMISSION_TYPE,
    PERMISSION_TYPE_KEY,
    PERMISSION_TYPE_KEYS,
)
from typing import Optional, Union
import json
from pydantic import BaseModel
from typing import Union, Optional
from starlite.status_codes import *


class ContentCreateModel(BaseModel):
    name: str
    image: Optional[Union[str, None]] = None
    tags: Optional[list[str]] = []
    data: Optional[dict] = {}


class ContentShareResultModel(BaseModel):
    uid: str
    owner: bool
    explicit: PERMISSION_TYPE
    implicit: PERMISSION_TYPE


class ShareContentModel(BaseModel):
    user: str
    shares: dict[PERMISSION_TYPE_KEY, Union[bool, None]]


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
            state.database, parent_id, session.user, "view"
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
            parent = ContentType.load_oid(loaded.parent, state.database)
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

    @post(
        "/{content_id:str}/modify/{setting:str}",
        guards=[guard_hasContentPermission("edit")],
        dependencies={"content": Provide(content_dep)},
    )
    async def modify_content(
        self,
        state: State,
        session: Session,
        content: ContentType,
        setting: str,
        data: Union[str, list[str], None],
    ) -> MinimalContentType:
        if not setting in ["name", "image", "tags"]:
            raise InvalidContentSettingError(extra=setting)

        if setting == "image" and content.image:
            manager: GenericContentManager = state.user_content
            manager.delete(content.image)

        setattr(content, setting, data)
        content.save()
        cluster: Cluster = state.cluster
        cluster.dispatch_update(
            content.sessions_with("view"), f"content.update.{content.parent}"
        )
        cluster.dispatch_update(
            content.sessions_with("view"), f"content.update.{content.oid}"
        )
        return MinimalContentType.from_ContentType(content, session.user)

    @get(
        "/{content_id:str}/shared",
        guards=[guard_hasContentPermission("share")],
        dependencies={"content": Provide(content_dep)},
    )
    async def get_shared(self, content: ContentType) -> list[ContentShareResultModel]:
        results = []
        implicit = content.resolved_permissions
        for s in implicit.keys():
            results.append(
                ContentShareResultModel(
                    uid=s,
                    owner=s == content.owner,
                    implicit=implicit[s],
                    explicit=content.resolve_permission_map(
                        content.shared[s]
                        if s in content.shared.keys()
                        else {
                            "view": None,
                            "edit": None,
                            "share": None,
                            "delete": None,
                            "admin": None,
                        }
                    ),
                )
            )

        return results

    @post(
        "/{content_id:str}/shared",
        guards=[guard_hasContentPermission("share")],
        dependencies={"content": Provide(content_dep)},
    )
    async def share_content(
        self,
        state: State,
        session: Session,
        content: ContentType,
        data: list[ShareContentModel],
    ) -> MinimalContentType:
        user = session.user
        user_perms = content.permissions_of(user)

        for d in data:
            if "admin" in d.shares.keys() and content.owner != user.oid:
                raise PermissionError(extra="(Must be owner)")
            if not d.user in content.shared.keys():
                content.shared[d.user] = {}
            for k in PERMISSION_TYPE_KEYS:
                if k in d.shares.keys():
                    if user_perms[k] == True:
                        content.shared[d.user][k] = d.shares[k]
                    else:
                        raise PermissionError(extra=f"(Must be {k} to assign)")
                else:
                    if not k in content.shared[d.user].keys():
                        content.shared[d.user][k] = None

        content.save()
        to_update = content.sessions_with("view")
        cluster: Cluster = state.cluster
        cluster.dispatch_update(to_update, f"content.update.{content.parent}")
        cluster.dispatch_update(to_update, f"content.update.{content.oid}")
        cluster.dispatch_update(to_update, f"content.share.{content.oid}")
        return MinimalContentType.from_ContentType(content, user)

    @delete(
        "/{content_id:str}/shared/{user:str}",
        guards=[guard_hasContentPermission("share")],
        dependencies={"content": Provide(content_dep)},
        status_code=HTTP_204_NO_CONTENT,
    )
    async def remove_share(self, state: State, content: ContentType, user: str) -> None:
        if not user in content.shared.keys():
            raise UserDoesNotExistError()

        to_update = content.sessions_with("view")
        del content.shared[user]
        content.save()
        cluster: Cluster = state.cluster
        cluster.dispatch_update(to_update, f"content.update.{content.parent}")
        cluster.dispatch_update(to_update, f"content.update.{content.oid}")
        cluster.dispatch_update(to_update, f"content.share.{content.oid}")
