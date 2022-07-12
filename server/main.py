from starlite import Starlite
from starlite.datastructures import State
from pymongo.mongo_client import MongoClient
from util import *
from controllers import *


def setup_state(state: State):
    state.config = Config()
    mncli = MongoClient(
        host=state.config["database"]["host"],
        port=state.config["database"]["port"],
        username=state.config["database"]["username"],
        password=state.config["database"]["password"],
        tls=state.config["database"]["tls"],
    )
    state.database = mncli[state.config["database"]["database"]]


app = Starlite(on_startup=[setup_state], route_handlers=[AccountController])
