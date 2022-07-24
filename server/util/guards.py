from typing import Any
from starlite import Request, BaseRouteHandler
from .exceptions import *
from models import *


def guard_loggedIn(request: Request[Any], _: BaseRouteHandler) -> None:
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


def guard_isGameOwner(request: Request[Any], _: BaseRouteHandler) -> None:
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


def guard_isGameParticipant(request: Request[Any], _: BaseRouteHandler) -> None:
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


def guard_debugMode(request: Request[Any], _: BaseRouteHandler) -> None:
    if not request.app.state.config["debug"]:
        raise DebugNotActiveError()
