from pydantic import BaseModel
from starlite import Starlite, MediaType, get
from starlite.datastructures import State
from starlite.exceptions.utils import create_exception_response
from starlette.responses import Response
from pymongo.mongo_client import MongoClient
from util import *
from controllers import *
import logging
import json

from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.errors import ServerErrorMiddleware
from starlette.responses import Response as StarletteResponse
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR

CONF = Config()
mncli = MongoClient(
    host=CONF["database"]["host"],
    port=CONF["database"]["port"],
    username=CONF["database"]["username"],
    password=CONF["database"]["password"],
    tls=CONF["database"]["tls"],
)
PLUG = PluginLoader(CONF["plugins"], mncli[CONF["database"]["database"]])


def setup_state(state: State):
    state.config = CONF
    state.database = mncli[state.config["database"]["database"]]
    state.plugins = PLUG


def http_exception_handler(request: Request, exc: Exception) -> StarletteResponse:
    """Default handler for exceptions subclassed from HTTPException"""

    logging.error(f"Failed parsing request: {request.method} {request.url.path}")

    status_code = (
        exc.status_code
        if isinstance(exc, StarletteHTTPException)
        else HTTP_500_INTERNAL_SERVER_ERROR
    )
    if status_code == HTTP_500_INTERNAL_SERVER_ERROR:
        # in debug mode, we just use the serve_middleware to create an HTML formatted response for us
        logging.exception(f"Encountered an error with code {status_code}:\n")
        server_middleware = ServerErrorMiddleware(app=request.app)
        return server_middleware.debug_response(request=request, exc=exc)

    """if isinstance(exc, BaseHTTPException):
        content = exc.detail
    elif isinstance(exc, HTTPException):
        content = {"detail": exc.detail, "extra": exc.extra}
    elif isinstance(exc, StarletteHTTPException):
        content = {"detail": exc.detail}
    else:
        content = {"detail": repr(exc)}"""

    return create_exception_response(exc)


class ConstraintsModel(BaseModel):
    max_games: int
    max_characters: int


class RootModel(BaseModel):
    debug: bool
    plugins: List[str]
    constraints: ConstraintsModel


@get()
async def get_debug_info(state: State) -> RootModel:
    return {
        "debug": state.config["debug"],
        "plugins": state.config["plugins"],
        "constraints": state.config["user_constraints"],
    }


BASE_HANDLERS = [
    get_debug_info,
    AccountController,
    PluginController,
    GameController,
    GameSpecificController,
    PluginDataSourceController,
    DebugController,
    PluginAssetController,
    CollectionsController,
]

for plugin in PLUG.plugins.values():
    BASE_HANDLERS.append(plugin.router)


app = Starlite(
    on_startup=[setup_state],
    route_handlers=BASE_HANDLERS,
    exception_handlers={500: http_exception_handler},
)
