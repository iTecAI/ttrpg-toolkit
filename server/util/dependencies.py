from typing import Any
from starlite import Request, State
from models import *
from .plugins import Plugin, PluginLoader
from .exceptions import PluginDoesNotExistError, ContentItemNotFoundError


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


def content_dep(state: State, content_id: str) -> ContentType:
    content: ContentType = ContentType.load_oid(content_id)
    if content == None:
        raise ContentItemNotFoundError(extra=content_id)

    return content
