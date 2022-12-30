from starlite import Controller, Provide, get
from util import (
    guard_loggedIn,
    session_dep,
    build_content_dep,
    guard_hasContentPermission,
)


class FolderContentController(Controller):
    path = "/content/folder/{content_id:str}"
    guards = [guard_loggedIn, guard_hasContentPermission("read", "folder")]
    dependencies = {
        "session": Provide(session_dep),
        "content": Provide(build_content_dep("folder")),
    }
