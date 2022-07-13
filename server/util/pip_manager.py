import sys, subprocess
from typing import Dict
from .exceptions import PluginLibraryError
from logging import critical


def pip_install(packages: list[str]):
    if len(packages) == 0:
        return
    proc = subprocess.run(
        [
            sys.executable,
            "-m",
            "pip",
            "install",
            "-q",
            "--isolated",
            "--no-input",
            "--no-color",
            "--no-cache-dir",
            "--disable-pip-version-check",
            " ".join(packages),
        ],
        text=True,
        stderr=subprocess.STDOUT,
        stdout=subprocess.PIPE,
    )
    if proc.returncode != 0:
        critical("Failed to install libraries. See error log below:\n" + proc.stdout)
        raise PluginLibraryError()
