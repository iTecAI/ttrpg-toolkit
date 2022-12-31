from starlite import Controller, Provide, get, post, State
from util import guard_loggedIn, session_dep, Cluster, Session
from util.exceptions import (
    InvalidContentTypeError,
    InvalidContentArgumentsError,
    ContentItemNotFoundError,
)
from models import (
    MINIMAL_CONTENT_TYPE,
    CONTENT_TYPE,
    CONTENT_TYPE_MAP,
    load_generic_content,
    load_generic_content_from_query,
    BaseContentType,
)
from typing import Optional
import json

from .folders import FolderContentController


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
        data: dict,
        parent: Optional[str] = "root",
    ) -> MINIMAL_CONTENT_TYPE:
        if not content_type in CONTENT_TYPE_MAP.keys():
            raise InvalidContentTypeError(extra=content_type)
        SELECTED_TYPE: CONTENT_TYPE = CONTENT_TYPE_MAP[content_type]
        try:
            new = SELECTED_TYPE.create(state.database, session.user, parent, **data)
        except:
            raise InvalidContentArgumentsError(extra=json.dumps(data))

        cluster: Cluster = state.cluster
        new.save()

        if parent != "root":
            parent_obj = load_generic_content(parent, state.database)
            if parent_obj == None:
                raise ContentItemNotFoundError(extra=f"[parent] {parent}")

            parent_obj.children.append(new.oid)
            parent_obj.save()
            cluster.dispatch_update(
                parent_obj.sessions_with("view"),
                f"content.update.{parent}",
                data={"type": "addChild"},
            )

        cluster.dispatch_update(
            new.sessions_with("view"), "content.update", data={"type": "create"}
        )

        return new.minimize

    @get("/{parent:str}")
    async def get_children(
        self, state: State, session: Session, parent: str
    ) -> list[MINIMAL_CONTENT_TYPE]:
        if parent == "root":
            parent_id = "root"
        else:
            parent_obj: CONTENT_TYPE = load_generic_content(parent, state.database)
            if parent_obj == None:
                raise ContentItemNotFoundError(extra=f"[parent] {parent}")
            parent_id = parent

        children: list[str] = BaseContentType.get_with_permission(
            state.database, parent_id, session.user, "read"
        )
        return [
            i.minimize
            for i in load_generic_content_from_query(
                {"oid": {"$in": children}}, state.database
            )
        ]
