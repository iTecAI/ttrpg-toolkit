import os
from typing import Any, Dict
from .pip_manager import pip_install
from .config import Config
from .exceptions import (
    PluginDoesNotExistError,
    PluginDependencyError,
    InvalidPluginError,
)
from logging import exception, critical

PLUGIN_LOCATION = os.path.join(".", "plugins")


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
