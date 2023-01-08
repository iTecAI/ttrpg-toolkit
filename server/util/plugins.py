from __future__ import annotations
import logging

import os
from types import ModuleType
from typing import Any, Dict, List, Union, Optional

from starlite import Controller, Router
from .pip_manager import pip_install
from .config import Config
from .exceptions import (
    PluginDataLoaderError,
    PluginDoesNotExistError,
    PluginDependencyError,
    InvalidPluginError,
    PluginEntrypointError,
    PluginNoDataSourceError,
    DataSourceCategoryNotFound,
)
from logging import exception, critical
from logging import info as linfo
import importlib
from pydantic import BaseModel
from .orm import ORM
from pymongo.database import Database
import glob
import threading
from .util_funcs import get_nested
import json

from models.plugins import DataSearchModel, DataSearchFieldModel

logging.basicConfig(level=logging.DEBUG)


class SearchModel(BaseModel):
    fields: Dict[str, str]


PLUGIN_LOCATION = os.path.join(".", "plugins")


class Entrypoint:
    def __init__(
        self,
        plugin_name: str,
        entrypoint_name: str,
        filename: str,
        controllers: list[str],
        exports: list[str],
    ) -> None:
        self.plugin_name = plugin_name
        self.name = entrypoint_name
        self.filename = filename
        try:
            loader = importlib.machinery.SourceFileLoader(
                f"{plugin_name}.{entrypoint_name}",
                os.path.join(PLUGIN_LOCATION, self.plugin_name, self.filename),
            )
            spec = importlib.util.spec_from_loader(
                f"{plugin_name}.{entrypoint_name}", loader
            )
            self.module: ModuleType = importlib.util.module_from_spec(spec)
            loader.exec_module(self.module)
        except:
            raise PluginEntrypointError(
                extra=f"Plugin {self.plugin_name} entrypoint {self.name} does not exist"
            )

        self.controller_map = {}
        for c in controllers:
            try:
                self.controller_map[c]: Controller = getattr(self.module, c)
            except:
                raise PluginEntrypointError(
                    extra=f"Could not load controller {c} from entrypoint {self.name} in plugin {self.plugin_name}"
                )

        self.exports = {}
        for e in exports:
            try:
                self.exports[e]: Any = getattr(self.module, e)
            except:
                raise PluginEntrypointError(
                    extra=f"Could not load generic export {e} from entrypoint {self.name} in plugin {self.plugin_name}"
                )

    @property
    def controllers(self) -> List[Controller]:
        return list(self.controller_map.values())


class DataSourceLoader:
    def __init__(self, plugin: "Plugin", source: Dict[str, Any], db: Database) -> None:
        self.plugin = plugin
        self.source = source
        self.db = db
        self.cache = self.db["plugin_data_cache"]

        if self.cache.count_documents({"plugin": self.plugin.slug}) != len(
            self.source["categories"].keys()
        ):
            linfo("Mismatch between categories & cached categories. Loading synced.")
            self.cache_searches()
        else:
            threading.Thread(target=self.cache_searches).start()

    def cache_searches(self):
        linfo(f"Caching search data for plugin {self.plugin.display_name}")
        for k, v in self.source["categories"].items():
            cat = {
                "plugin": self.plugin.slug,
                "category": k,
                "cache": [],
                "idCache": {},
                "searchParams": {},
            }

            files = []
            for f in v["files"]:
                files.extend(
                    glob.glob(f, root_dir=self.plugin.plugin_directory, recursive=True)
                )

            records = []
            for f in files:
                with open(os.path.join(self.plugin.plugin_directory, f), "r") as fp:
                    c = json.load(fp)
                if type(c) == dict:
                    records.append({"_file": f, "_record": "self", "data": c})
                elif type(c) == list:
                    records.extend(
                        [
                            {"_file": f, "_record": i, "data": c[i]}
                            for i in range(len(c))
                        ]
                    )
                else:
                    raise PluginDataLoaderError(
                        extra=f"Failed to load file [{f}] from category [{k}] of plugin [{self.plugin.display_name}] due to invalid record structure."
                    )

            for r in records:
                to_add = {}
                for fk, fv in v["search_fields"].items():
                    if type(fv["field"]) == list:
                        fv["field"] = ".".join(fv["field"])
                    try:
                        val = get_nested(r["data"], fv["field"])
                    except KeyError:
                        continue
                    to_add[fv["field"]] = val

                    if not fk in cat["searchParams"].keys():
                        cat["searchParams"][fk] = {}

                    if val != None:
                        try:
                            if fv["type"] in ["string", "boolean"]:
                                pass
                            elif fv["type"] == "number":
                                if not "max" in cat["searchParams"][fk].keys() or cat[
                                    "searchParams"
                                ][fk]["max"] < int(val):
                                    cat["searchParams"][fk]["max"] = val
                                if not "min" in cat["searchParams"][fk].keys() or cat[
                                    "searchParams"
                                ][fk]["min"] > int(val):
                                    cat["searchParams"][fk]["min"] = val
                            elif fv["type"] == "select":
                                if not "choices" in cat["searchParams"][fk].keys():
                                    cat["searchParams"][fk]["choices"] = []
                                if type(val) == list:
                                    cat["searchParams"][fk]["choices"].extend(
                                        list(
                                            set(
                                                [
                                                    v
                                                    for v in val
                                                    if not v
                                                    in cat["searchParams"][fk][
                                                        "choices"
                                                    ]
                                                ]
                                            )
                                        )
                                    )
                                else:
                                    if not val in cat["searchParams"][fk]["choices"]:
                                        cat["searchParams"][fk]["choices"].append(val)
                        except:
                            pass

                to_add["_file"] = r["_file"]
                to_add["_record"] = r["_record"]
                cat["cache"].append(to_add)
                cat["idCache"][r["data"]["slug"]] = [r["_file"], r["_record"]]

            self.cache.replace_one(
                {"plugin": self.plugin.slug, "category": k}, cat, upsert=True
            )
        linfo(f"Done caching search data for plugin {self.plugin.display_name}")

    def _check_rv(self, field: DataSearchFieldModel, record_value: Any):
        matches = 0
        nulls = 0
        if field.field_type == "string":
            current = str(record_value)
            target = str(field.value)
            if field.exact:
                matches += 1 if target.lower() == current.lower() else 0
            else:
                matches += (
                    1
                    if target.lower() in current.lower()
                    or current.lower() in target.lower()
                    else 0
                )
        elif field.field_type == "number":
            try:
                current = int(record_value)
                target = int(field.value)
            except:
                nulls += 1
                return matches, nulls
            if field.comparator == "<":
                matches += int(current < target)
            elif field.comparator == "<=":
                matches += int(current <= target)
            elif field.comparator == "=":
                matches += int(current == target)
            elif field.comparator == ">=":
                matches += int(current >= target)
            elif field.comparator == ">":
                matches += int(current > target)
            elif field.comparator == "!=":
                matches += int(current != target)
        elif field.field_type == "boolean":
            v = True if field.value == "true" else False
            matches += int(v == record_value)
        elif field.field_type == "select":
            if type(field.value) == list:
                matches += int(
                    len(
                        [
                            True
                            for cfv in field.value
                            if str(cfv).lower() == str(record_value).lower()
                        ]
                    )
                    > 0
                )
            else:
                matches += int(str(field.value).lower() == str(record_value).lower())

        return matches, nulls

    def search(
        self,
        model: DataSearchModel,
        page: Optional[int] = 0,
        perPage: Optional[int] = -1,
    ) -> dict:
        if not model.category in self.source["categories"].keys():
            raise ValueError("Category not found.")

        cached_data = self.cache.find_one(
            {"plugin": self.plugin.slug, "category": model.category}
        )
        if not cached_data:
            return []

        results = []

        for record in cached_data["cache"]:
            matches = 0
            nulls = 0
            for field_name, field in model.fields.items():
                record_key = self.source["categories"][model.category]["search_fields"][
                    field_name
                ]["field"]
                if not record_key in record.keys():
                    nulls += 0
                    continue
                record_value = record[record_key]
                if record_value == None:
                    nulls += 1
                    continue

                nm = 0
                nn = 0
                if type(record_value) == list:
                    current = [0, 0]
                    for r in record_value:
                        new = self._check_rv(field, r)
                        current[0] += new[0]
                        current[1] += new[1]

                    if field.field_type == "select":
                        nm += int(current[0] == len(field.value))
                    else:
                        if current[0] > 0 or current[1] > 0:
                            nm += 1

                else:
                    nm, nn = self._check_rv(field, record_value)

                matches += nm
                nulls += nn

            if model.all_required:
                if matches + nulls == len(model.fields.keys()):
                    results.append(record)
            elif matches >= 1:
                results.append(record)
            elif len(model.fields.keys()) == 0:
                results.append(record)
        if perPage < 0:
            to_expand = results[:]
        else:
            to_expand = results[perPage * page : perPage * (page + 1)]
        parsed_results = []
        for r in to_expand:
            with open(
                os.path.join(self.plugin.plugin_directory, r["_file"]), "r"
            ) as fp:
                fdata = json.load(fp)
            if r["_record"] == "self":
                parsed_results.append(fdata)
            else:
                try:
                    parsed_results.append(fdata[r["_record"]])
                except:
                    pass

        return {"results": parsed_results, "page": page, "total_results": len(results)}

    def get_by_slug(self, category: str, slug: str) -> Any:
        if not category in self.source["categories"].keys():
            raise ValueError("Category not found.")

        cached_data = self.cache.find_one(
            {"plugin": self.plugin.slug, "category": category}
        )
        if not cached_data:
            return []

        if not slug in cached_data["idCache"].keys():
            raise KeyError(f"Slug {slug} not found in category {category}")

        location = cached_data["idCache"][slug]
        data = Config(os.path.join(self.plugin.plugin_directory, location[0]))
        if location[1] == "self":
            return data.data
        else:
            return data.data[location[1]]


class Plugin:
    def __init__(self, name: str, loader, db: Database) -> None:
        self.name = name
        self.loader = loader
        if not os.path.exists(os.path.join(PLUGIN_LOCATION, name)):
            raise PluginDoesNotExistError(extra=name)
        try:
            if os.path.exists(os.path.join(PLUGIN_LOCATION, name, "manifest.json")):
                self.manifest = Config(
                    file=os.path.join(PLUGIN_LOCATION, name, "manifest.json")
                )
            elif os.path.exists(os.path.join(PLUGIN_LOCATION, name, "manifest.json5")):
                self.manifest = Config(
                    file=os.path.join(PLUGIN_LOCATION, name, "manifest.json5")
                )
            else:
                raise InvalidPluginError(
                    extra=f"{name} - manifest.json/5 does not exist"
                )
        except OSError:
            raise InvalidPluginError(extra=f"{name} - manifest.json/5 does not exist")
        except:
            raise InvalidPluginError(
                extra=f"{name} - manifest.json/5 could not be parsed"
            )

        self.plugin_directory = os.path.join(PLUGIN_LOCATION, name)
        self.slug = self._manifest("plugin_data.slug")
        self.display_name = self._manifest("plugin_data.display_name")
        linfo(f"Loading plugin {self.display_name}")
        self.tags = self._manifest("plugin_data.tags")
        self.dependencies = self._manifest("plugin_data.dependencies", default=[])
        self.libraries = self._manifest("plugin_data.libraries", default=[])

        pip_install(self.libraries)

        self.entrypoints_map: dict = self._manifest("entrypoints")
        self.entrypoints: Dict[str, Entrypoint] = {
            k: Entrypoint(
                self.name,
                k,
                self._manifest(["entrypoints", k, "file"]),
                self._manifest(["entrypoints", k, "controllers"], default=[]),
                self._manifest(["entrypoints", k, "exports"], default=[]),
            )
            for k in self.entrypoints_map.keys()
        }

        controllers = []
        self.exports = {}
        for e in self.entrypoints.values():
            controllers.extend(e.controllers)
            for x in e.exports.keys():
                self.exports[x] = e.exports[x]

        self.router = Router(path=f"/plugins/{self.name}", route_handlers=controllers)

        if "data_source" in self.tags:
            self.data_source: DataSourceLoader = DataSourceLoader(
                self, self.manifest["data_source"], db
            )
        else:
            self.data_source = None

    def _manifest(self, key: str | list[str], default: Any = "$nodef"):
        try:
            return eval(
                "self.manifest['{keys}']".format(
                    keys="']['".join(key.split(".") if type(key) == str else key)
                ),
                {"self": self},
            )
        except KeyError:
            if default == "$nodef":
                raise InvalidPluginError(
                    extra=f"{self.name} - manifest.json missing key {key}"
                )
            else:
                return default

    def check_dependencies(self, available: list[str]) -> list[str]:
        missing = []
        for d in self.dependencies:
            if not d in available:
                missing.append(
                    f"Plugin '{self.display_name}' ({self.name}) is missing dependency: {d}"
                )
        return missing

    def __getattr__(self, attr: str) -> Any:
        try:
            return self.exports[attr]
        except KeyError:
            raise AttributeError(f"{attr} is not a valid export.")

    @property
    def dependency_exports(self):
        exps = {}
        for p in self.loader.get_dep_refs(self.name):
            for e in p.exports.keys():
                exps[e] = p.exports[e]

    @property
    def is_data_source(self):
        return "data_source" in self.tags

    def search_data(self, model: SearchModel, category: str) -> List[Any]:
        if not self.is_data_source:
            raise PluginNoDataSourceError()

        if not category in self._manifest("data_source.categories").keys():
            raise DataSourceCategoryNotFound(extra=category)

        return getattr(
            self.data_source,
            self._manifest(["data_source", "categories", category, "search"]),
        )(model)

    def load_data(self, model: Any, category: str) -> ORM:
        if not self.is_data_source:
            raise PluginNoDataSourceError()

        if not category in self._manifest("data_source.categories").keys():
            raise DataSourceCategoryNotFound(extra=category)

        return getattr(
            self.data_source,
            self._manifest(["data_source", "categories", category, "load"]),
        )(model)


class PluginLoader:
    def __init__(self, active: list[str], db: Database) -> None:
        self.plugins: Dict[str, Plugin] = {}
        for p in active:
            try:
                self.plugins[p] = Plugin(p, self, db)
            except:
                exception(f"Failed to load plugin {p}:\n")

        missing = []
        for p in self.plugins.values():
            missing.extend(p.check_dependencies(list(self.plugins.keys())))

        if len(missing) != 0:
            critical("Dependency resolution errors:\n\t" + "\n\t".join(missing))
            raise PluginDependencyError()

    def __getitem__(self, key: str) -> Plugin:
        return self.plugins[key]

    def get_dep_refs(self, plugin: str) -> List[Plugin]:
        return [self.plugins[p] for p in self.plugins[plugin].dependencies]
