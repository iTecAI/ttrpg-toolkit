from typing import Any
from starlite import Request, State
from models import *


def session_dep(state: State, request: Request[Any]) -> Session | None:
    if not "authorization" in request.headers.keys():
        return
    session = Session.load_oid(request.headers["authorization"], state.database)
    return session
