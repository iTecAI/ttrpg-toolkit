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
)
from typing import Optional
import json


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

        if parent != "root":
            parent_obj = load_generic_content(parent, state.database)
            if parent_obj == None:
                raise ContentItemNotFoundError(extra=f"[parent] {parent}")

            parent_obj.children.append(new.oid)
            parent_obj.save()

        new.save()
        return new.minimize
