from typing import Any
from starlite import Request, BaseRouteHandler
from .exceptions import *
from models import *


def guard_loggedIn(request: Any, _: BaseRouteHandler) -> None:
    if not "authorization" in request.headers.keys():
        raise AuthorizationFailedError(extra="@ No header")

    session: Session = Session.load_oid(
        request.headers["authorization"], request.app.state.database
    )
    if session == None:
        raise AuthorizationFailedError(extra="@ Session not found")

    if not session.valid:
        request.app.state.database[Session.collection].delete_one({"oid": session.oid})
        raise AuthorizationFailedError(extra="@ Session expired")

    session.refresh()
    session.save()


def guard_isGameOwner(request: Any, _: BaseRouteHandler) -> None:
    if not "game_id" in request.path_params.keys():
        raise GenericNetworkError(extra="Game ID not passed to Guard")

    session: Session = Session.load_oid(
        request.headers["authorization"], request.app.state.database
    )
    if session == None:
        raise AuthorizationFailedError(extra="@ Session not found")

    game: Game = Game.load_oid(
        request.path_params["game_id"], request.app.state.database
    )
    if game == None:
        raise GameNotFound()

    if not game.owner_id == session.uid:
        raise GameNotOwned()


def guard_isGameParticipant(request: Any, _: BaseRouteHandler) -> None:
    if not "game_id" in request.path_params.keys():
        raise GenericNetworkError(extra="Game ID not passed to Guard")

    session: Session = Session.load_oid(
        request.headers["authorization"], request.app.state.database
    )
    if session == None:
        raise AuthorizationFailedError(extra="@ Session not found")

    game: Game = Game.load_oid(
        request.path_params["game_id"], request.app.state.database
    )
    if game == None:
        raise GameNotFound()

    if not session.uid in game.participants:
        raise GameNotFound()


def guard_debugMode(request: Any, _: BaseRouteHandler) -> None:
    if not request.app.state.config["debug"]:
        raise DebugNotActiveError()


def guard_isDataSource(request: Any, _: BaseRouteHandler) -> None:
    # print(request.path_params)
    pass


def guard_hasContentPermission(permission: PERMISSION_TYPE_KEY, content_type: str):
    SELECTED_TYPE: CONTENT_TYPE = CONTENT_TYPE_MAP[content_type]

    def guard_intl_hasContentPermission(request: Any, _: BaseRouteHandler) -> None:
        if not "content_id" in request.path_params.keys():
            raise GenericNetworkError(extra="Content ID not passed to Guard")

        session: Session = Session.load_oid(
            request.headers["authorization"], request.app.state.database
        )
        if session == None:
            raise AuthorizationFailedError(extra="@ Session not found")

        content: BaseContentType = SELECTED_TYPE.load_oid(
            request.path_params["content_id"], request.app.state.database
        )
        if content == None:
            raise ContentItemNotFoundError(extra=request.path_params["content_id"])

        if not content.check_permission(permission, session.user):
            raise PermissionError()

    return guard_intl_hasContentPermission
