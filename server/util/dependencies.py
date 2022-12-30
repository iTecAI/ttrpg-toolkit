from typing import Any
from starlite import Request, State
from models import *
from .plugins import Plugin, PluginLoader
from .exceptions import PluginDoesNotExistError, ContentItemNotFoundError
from models.content import CONTENT_TYPE, CONTENT_TYPE_MAP


def session_dep(state: State, request: Any) -> Session | None:
    if not "authorization" in request.headers.keys():
        return
    session = Session.load_oid(request.headers["authorization"], state.database)
    return session


def game_dep(state: State, game_id: str) -> Game:
    return Game.load_oid(game_id, state.database)


def plugin_dep(state: State, plugin: str) -> Plugin:
    loader: PluginLoader = state.plugins
    try:
        return loader[plugin]
    except:
        raise PluginDoesNotExistError(extra=plugin)


def build_content_dep(content_type: str):
    SELECTED_TYPE: CONTENT_TYPE = CONTENT_TYPE_MAP[content_type]

    def content_dep(state, content_id: str) -> CONTENT_TYPE:
        content: SELECTED_TYPE = SELECTED_TYPE.load_oid(content_id)
        if content == None:
            raise ContentItemNotFoundError(extra=content_id)

        return content

    return content_dep
