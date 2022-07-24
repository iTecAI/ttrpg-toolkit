from typing import Any, Optional, List
from pydantic import BaseModel
from starlite import Controller, Provide, Request, State, post, get
from starlite.types import Guard
from models import Session, User
from util import exceptions, guard_debugMode, Config, PluginLoader
from starlette.status import *
from logging import warning


class DebugController(Controller):
    path: str = "/debug"

    @post("/reload/config", guards=[guard_debugMode])
    async def reload_config(self, state: State) -> None:
        warning("RELOADING CONFIG - DEBUG MODE FUNCTION")
        state.config = Config()

    @post("/reload/plugins", guards=[guard_debugMode])
    async def reload_plugins(self, state: State) -> None:
        warning("RELOADING PLUGINS - DEBUG MODE FUNCTION")
        state.plugins = PluginLoader(state.config["plugins"])
