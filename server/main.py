from starlite import Starlite
from starlite.datastructures import State
from pymongo.mongo_client import MongoClient
from util import *
from controllers import *

CONF = Config()
PLUG = PluginLoader(CONF["plugins"])


def setup_state(state: State):
    state.config = CONF
    mncli = MongoClient(
        host=state.config["database"]["host"],
        port=state.config["database"]["port"],
        username=state.config["database"]["username"],
        password=state.config["database"]["password"],
        tls=state.config["database"]["tls"],
    )
    state.database = mncli[state.config["database"]["database"]]
    state.plugins = PLUG


BASE_HANDLERS = [AccountController, PluginController]

for plugin in PLUG.plugins.values():
    BASE_HANDLERS.append(plugin.router)


app = Starlite(on_startup=[setup_state], route_handlers=BASE_HANDLERS)
