from typing import Dict, List, Optional
from pydantic import BaseModel
from starlite import Controller, State, get, post, Provide
from starlite.types import Guard
from util import guard_loggedIn, PluginLoader, session_dep, exceptions
from models import Session
from enum import Enum
from starlette.status import *


class PluginModel(BaseModel):
    slug: str
    displayName: str
    tags: List[str]
    dependencies: List[str]


# === PluginManifest submodels ===
class PluginDataModel(BaseModel):
    slug: str
    displayName: str
    tags: List[str]
    dependencies: Optional[List[str]] = []
    libraries: Optional[List[str]] = []


class EntrypointModel(BaseModel):
    file: str
    controllers: Optional[List[str]] = []
    exports: Optional[List[str]] = []


# === Dice Type Models ===
class RollType(Enum):
    INTEGER = "integer"
    SELECTION = "selection"


class RollImplementationModel(BaseModel):
    type: RollType
    type_map: Dict[str, List[int | str]]


class DiceTypeModel(BaseModel):
    types: List[str]
    roll_implementation: RollImplementationModel
    implements_object: Optional[bool] = False
    implements_string: Optional[bool] = False
    reroll_operations: Optional[Dict[str, str]] = {}


# === Manifest Model ===
class PluginManifestModel(BaseModel):
    plugin_data: PluginDataModel
    entrypoints: Dict[str, EntrypointModel]
    dice: Optional[DiceTypeModel | None] = None


# === Exceptions ===
class PluginNotFoundError(exceptions.BaseHTTPException):
    message: str = "Plugin not found"
    message_class: str = "error.plugin.not_found"
    status_code: int = HTTP_404_NOT_FOUND


class PluginController(Controller):
    path = "/plugins"
    guards: Optional[List[Guard]] = [guard_loggedIn]
    dependencies: Optional[Dict[str, "Provide"]] = {"session": Provide(session_dep)}

    @get("/")
    async def list_plugins(self, state: State, session: Session) -> List[PluginModel]:
        loader: PluginLoader = state.plugins
        return [
            PluginModel(
                slug=p.slug,
                displayName=p.display_name,
                tags=p.tags,
                dependencies=p.dependencies,
            )
            for p in loader.plugins.values()
        ]

    @get("/{plugin:str}")
    async def get_plugin_manifest(
        self, plugin: str, state: State, session: Session
    ) -> PluginManifestModel:
        if plugin in state.plugins.plugins.keys():
            return state.plugins.plugins[plugin].manifest.data
        else:
            raise PluginNotFoundError()
