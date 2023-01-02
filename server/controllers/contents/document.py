from starlite import Controller, get, post, Provide
from util import guard_loggedIn, session_dep, Session


class DocumentTypeController(Controller):
    path = "/content_types/documents"
    guards = [guard_loggedIn]
    dependencies = {"session": Provide(session_dep)}
