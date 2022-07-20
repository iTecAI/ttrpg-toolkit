from starlite import Starlite, MediaType
from starlite.datastructures import State
from starlette.responses import Response
from pymongo.mongo_client import MongoClient
from util import *
from controllers import *
import logging

from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.errors import ServerErrorMiddleware
from starlette.responses import Response as StarletteResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

CONF = Config()
PLUG = PluginLoader(CONF["plugins"])


def setup_state(state: State):
    state.config = CONF
    mncli = MongoClient(
        host=state.config["database"]["host"],
        port=state.config["database"]["port"],
        username=state.config["database"]["username"],
        password=state.config["database"]["password"],
        tls=state.config["database"]["tls"],
    )
    state.database = mncli[state.config["database"]["database"]]
    state.plugins = PLUG


def http_exception_handler(request: Request, exc: Exception) -> StarletteResponse:
    """Default handler for exceptions subclassed from HTTPException"""

    status_code = (
        exc.status_code
        if isinstance(exc, StarletteHTTPException)
        else HTTP_500_INTERNAL_SERVER_ERROR
    )
    logging.exception(f"Encountered an error with code {status_code}:\n")
    if status_code == HTTP_500_INTERNAL_SERVER_ERROR:
        # in debug mode, we just use the serve_middleware to create an HTML formatted response for us
        server_middleware = ServerErrorMiddleware(app=request.app)
        return server_middleware.debug_response(request=request, exc=exc)
    if isinstance(exc, HTTPException):
        content = {"detail": exc.detail, "extra": exc.extra}
    elif isinstance(exc, StarletteHTTPException):
        content = {"detail": exc.detail}
    else:
        content = {"detail": repr(exc)}
    return Response(
        media_type=MediaType.JSON,
        content=content,
        status_code=status_code,
    )


BASE_HANDLERS = [
    AccountController,
    PluginController,
    GameController,
    GameSpecificController,
    PluginDataSourceController,
]

for plugin in PLUG.plugins.values():
    BASE_HANDLERS.append(plugin.router)


app = Starlite(
    on_startup=[setup_state],
    route_handlers=BASE_HANDLERS,
    exception_handlers={500: http_exception_handler},
)
