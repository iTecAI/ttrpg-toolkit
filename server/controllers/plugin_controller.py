import os
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from starlite import Controller, State, get, post, Provide
from starlite.types import Guard
from util import (
    guard_loggedIn,
    PluginLoader,
    session_dep,
    exceptions,
    plugin_dep,
    Plugin,
)
from util.plugin_utils import SearchModel
from models import Session
from enum import Enum
from starlette.status import *
from starlite.datastructures import File
import mimetypes


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


class AssetNotFoundError(exceptions.BaseHTTPException):
    message: str = "Asset not found"
    message_class: str = "error.plugin.asset_not_found"
    status_code: int = HTTP_404_NOT_FOUND


class PluginAssetController(Controller):
    path = "/plugins/{plugin:str}/assets"

    @get("/")
    async def list_plugin_assets(self, state: State, plugin: str) -> List[str]:
        if plugin in state.plugins.plugins.keys():
            if (
                "assets"
                in state.plugins.plugins[plugin].manifest["plugin_data"]["tags"]
            ):
                return list(state.plugins.plugins[plugin].manifest["assets"].keys())
            else:
                return []
        else:
            raise PluginNotFoundError()

    @get("/{asset:str}")
    async def get_plugin_asset(self, state: State, plugin: str, asset: str) -> File:
        if plugin in state.plugins.plugins.keys():
            if (
                "assets"
                in state.plugins.plugins[plugin].manifest["plugin_data"]["tags"]
            ):
                if asset in state.plugins.plugins[plugin].manifest["assets"].keys():
                    mime = mimetypes.guess_type(
                        state.plugins.plugins[plugin].manifest["assets"][asset]
                    )
                    if type(mime) == tuple:
                        mime = "text/plain"

                    return File(
                        path=os.path.join(
                            state.plugins.plugins[plugin].plugin_directory,
                            os.path.join(
                                *state.plugins.plugins[plugin]
                                .manifest["assets"][asset]
                                .split("/")
                            ),
                        ),
                        filename=os.path.split(
                            state.plugins.plugins[plugin].manifest["assets"][asset]
                        )[1],
                        headers={"Content-Type": mime},
                    )
                else:
                    raise AssetNotFoundError()
            else:
                raise AssetNotFoundError()
        else:
            raise PluginNotFoundError()


class PluginController(Controller):
    path = "/plugins"
    guards: Optional[List[Guard]] = [guard_loggedIn]
    dependencies: Optional[Dict[str, "Provide"]] = {"session": Provide(session_dep)}

    @get("/")
    async def list_plugins(
        self, state: State, session: Session, tag: Optional[str] = None
    ) -> List[PluginModel]:
        loader: PluginLoader = state.plugins
        return [
            PluginModel(
                slug=p.slug,
                displayName=p.display_name,
                tags=p.tags,
                dependencies=p.dependencies,
            )
            for p in loader.plugins.values()
            if tag in p.tags or tag == None
        ]

    @get("/{plugin:str}")
    async def get_plugin_manifest(
        self, plugin: str, state: State, session: Session
    ) -> PluginManifestModel:
        if plugin in state.plugins.plugins.keys():
            return state.plugins.plugins[plugin].manifest.data
        else:
            raise PluginNotFoundError()


class DataLoadModel(BaseModel):
    items: List[Any]


class PluginDataSourceController(Controller):
    path: str = "/plugins/{plugin:str}/data"
    guards: Optional[List[Guard]] = []
    dependencies: Optional[Dict[str, "Provide"]] = {
        "session": Provide(session_dep),
        "plugin_object": Provide(plugin_dep),
    }

    @post("/{category:str}/search/minimal", status_code=HTTP_200_OK)
    async def search_category_minimal(
        self,
        plugin_object: Plugin,
        category: str,
        data: SearchModel,
    ) -> List[Any]:
        return plugin_object.search_data(data, category)

    @post("/{category:str}/search", status_code=HTTP_200_OK)
    async def search_category(
        self,
        plugin_object: Plugin,
        category: str,
        data: SearchModel,
    ) -> List[Any]:
        search_results = plugin_object.search_data(data, category)
        results = []
        for d in search_results:
            item = plugin_object.load_data(d, category)
            if type(item) == list:
                results.extend([i.raw for i in item])
            else:
                results.append(item.raw)

        return results

    @post("/{category:str}/load", status_code=HTTP_200_OK)
    async def load_data_from_category(
        self,
        plugin_object: Plugin,
        category: str,
        data: DataLoadModel,
    ) -> List[Any]:
        results = []
        for d in data.items:
            item = plugin_object.load_data(d, category)
            if type(item) == list:
                results.extend([i.raw for i in item])
            else:
                results.append(item.raw)

        return results
