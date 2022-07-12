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
