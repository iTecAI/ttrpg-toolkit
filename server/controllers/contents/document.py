from starlite import Controller, get, post, Provide, State
from util import (
    guard_loggedIn,
    session_dep,
    Session,
    content_dep,
    guard_hasContentPermission,
)
from models import ContentType, DocumentContentType, ExpandedContentType
from typing import Any
from util.exceptions import InvalidContentTypeError, ContentItemNotFoundError


class DocumentTypeController(Controller):
    path = "/content_types/documents"
    guards = [guard_loggedIn]
    dependencies = {"session": Provide(session_dep)}

    @post(
        "/{content_id:str}/update",
        dependencies={"content": Provide(content_dep)},
        guards=[guard_hasContentPermission("edit")],
    )
    async def update_document(
        self, state: State, session: Session, content: ContentType, data: dict[str, Any]
    ) -> ExpandedContentType:
        if content.dataType != "document":
            raise InvalidContentTypeError(extra=content.dataType)
        if content.data == None:
            raise InvalidContentTypeError(extra="Data ID not provided")
        doc = DocumentContentType.load_oid(content.data, state.database)
        if doc == None:
            raise ContentItemNotFoundError(
                extra="Container located, data item not found"
            )

        doc.contents = data
        doc.save()
        return ExpandedContentType.from_ContentType(content, session.user)
