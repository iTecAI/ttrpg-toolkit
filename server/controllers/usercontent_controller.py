from starlite import (
    post,
    get,
    Controller,
    Provide,
    State,
    Stream,
    Body,
    RequestEncodingType,
)
from starlite.datastructures import UploadFile
from util import Session, GenericContentManager
from util.exceptions import ContentNotFoundError
from util.guards import guard_loggedIn
from util.dependencies import session_dep
from typing import Dict, Optional
from pydantic import BaseModel


class ItemId(BaseModel):
    itemId: str


class UserContentController(Controller):
    path: str = "/user_content"
    dependencies: Optional[Dict[str, "Provide"]] = {"session": Provide(session_dep)}

    @get("/{id:str}")
    async def get_item(self, state: State, id: str) -> Stream:
        manager: GenericContentManager = state.user_content
        try:
            result = manager.load(id)
        except:
            raise ContentNotFoundError(extra=id)

        return result

    @post("/", guards=[guard_loggedIn])
    async def create_item(
        self,
        state: State,
        session: Session,
        data: UploadFile = Body(media_type=RequestEncodingType.MULTI_PART),
    ) -> ItemId:
        manager: GenericContentManager = state.user_content
        return {"itemId": await manager.save(data, session.user)}
