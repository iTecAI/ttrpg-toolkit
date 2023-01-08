import os
from typing import Any, Dict, List, Optional, Union
from unicodedata import category
from pydantic import BaseModel
from starlite import Controller, State, get, post, Provide
from starlite.types import Guard
from models import DataSearchModel
from util import (
    guard_loggedIn,
    PluginLoader,
    session_dep,
    exceptions,
    plugin_dep,
    Plugin,
    guard_isDataSource,
    get_nested,
)
from util.plugin_utils import SearchModel
from models import Session
from enum import Enum
from starlette.status import *
from starlite.datastructures import File
import mimetypes
from pymongo.collection import Collection


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


class CategoryNotFoundError(exceptions.BaseHTTPException):
    message: str = "Category not found"
    message_class: str = "error.plugin.category_not_found"
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
                "asset_pack"
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
        self, plugin: str, state: State, session: Session, path: Optional[str] = None
    ) -> PluginManifestModel:
        if plugin in state.plugins.plugins.keys():
            if path:
                dat = state.plugins.plugins[plugin].manifest.data
                try:
                    return get_nested(dat, path)
                except:
                    raise exceptions.PluginPathDoesNotExistError(extra=path)
            else:
                return state.plugins.plugins[plugin].manifest.data
        else:
            raise PluginNotFoundError()

    @get("/all/{key:str}")
    async def get_all_keys(
        self, state: State, session: Session, key: str
    ) -> dict[str, Union[dict[str, Any], None]]:
        out = {}
        for k in state.plugins.plugins.keys():
            plug: Plugin = state.plugins.plugins[k]
            try:
                out[k] = get_nested(plug.manifest.data, key)
            except:
                out[k] = None

        return out


class DataLoadModel(BaseModel):
    category: str
    items: List[str]


class DataSearchResultModel(BaseModel):
    results: List[Any]
    page: int
    total_results: int


class PluginDataSourceController(Controller):
    path: str = "/plugins/{plugin:str}/data"
    guards: Optional[List[Guard]] = [guard_isDataSource]
    dependencies: Optional[Dict[str, "Provide"]] = {
        "session": Provide(session_dep),
        "plugin_object": Provide(plugin_dep),
    }

    @post("/search", status_code=HTTP_200_OK)
    async def search(
        self,
        plugin_object: Plugin,
        data: DataSearchModel,
        page: Optional[int] = None,
        count: Optional[int] = None,
    ) -> DataSearchResultModel:
        return plugin_object.data_source.search(
            data, page=page if page else 0, perPage=count if count else -1
        )

    @post("/load", status_code=HTTP_200_OK)
    async def load_data(
        self,
        plugin_object: Plugin,
        data: DataLoadModel,
    ) -> Dict[str, Any]:
        results = {}
        for d in data.items:
            try:
                results[d] = plugin_object.data_source.get_by_slug(data.category, d)
            except:
                results[d] = None
        return results

    @get("/search_params/{category:str}")
    async def get_search_params(
        self, plugin_object: Plugin, state: State, category: str
    ) -> Dict[str, Any]:
        collection: Collection = state.database["plugin_data_cache"]
        cache = collection.find_one(
            {"plugin": plugin_object.slug, "category": category}
        )
        if not cache:
            raise CategoryNotFoundError()

        return cache["searchParams"]
