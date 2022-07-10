from starlite import Starlite
from starlite.datastructures import State
from util import *

def setup_state(state: State):
    state.config = Config()

    print(state.config.data)

app = Starlite(on_startup=[setup_state], route_handlers=[])