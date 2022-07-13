import os
from types import ModuleType
from typing import Any, Dict, List

from starlite import Controller, Router
from .pip_manager import pip_install
from .config import Config
from .exceptions import (
    PluginDoesNotExistError,
    PluginDependencyError,
    InvalidPluginError,
    PluginEntrypointError,
)
from logging import exception, critical
import importlib

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


class Plugin:
    def __init__(self, name: str) -> None:
        self.name = name
        if not os.path.exists(os.path.join(PLUGIN_LOCATION, name)):
            raise PluginDoesNotExistError(extra=name)
        try:
            self.manifest = Config(
                file=os.path.join(PLUGIN_LOCATION, name, "manifest.json")
            )
        except OSError:
            raise InvalidPluginError(extra=f"{name} - manifest.json does not exist")
        except:
            raise InvalidPluginError(
                extra=f"{name} - manifest.json could not be parsed"
            )

        self.slug = self._manifest("plugin_data.slug")
        self.display_name = self._manifest("plugin_data.display_name")
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
        for e in self.entrypoints.values():
            controllers.extend(e.controllers)

        self.router = Router(path=f"/plugins/{self.name}", route_handlers=controllers)

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


class PluginLoader:
    def __init__(self, active: list[str]) -> None:
        self.plugins: Dict[str, Plugin] = {}
        for p in active:
            try:
                self.plugins[p] = Plugin(p)
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
