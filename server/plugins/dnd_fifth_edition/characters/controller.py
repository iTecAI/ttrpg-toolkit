from starlite import Controller, get, post, State, Provide
from util import session_dep, Session


class Character5eController(Controller):
    path = "/characters"
    dependencies = {"session": Provide(session_dep)}
