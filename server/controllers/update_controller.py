from starlite import Controller, get, post, websocket, WebSocket, State


class UpdateController(Controller):
    path: str = "/updates"
