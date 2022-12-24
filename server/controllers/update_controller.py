from starlite import Controller, get, post, State, Provide
from starlite.response import StreamingResponse
from util import Cluster, Session
from util.exceptions import AuthorizationFailedError
from typing import TypedDict, Any
import json
import time
from sse_starlette.sse import EventSourceResponse


class EventType(TypedDict):
    event: str
    data: dict[str, Any]
    dispatched: float


def encode(data):
    return {"data": json.dumps(data)}


class UpdateController(Controller):
    path: str = "/updates"

    @get("/subscribe/{sessionId:str}")
    async def subscribe(self, state: State, sessionId: str) -> EventSourceResponse:
        session = Session.load_oid(sessionId, state.database)
        if session == None:
            raise AuthorizationFailedError()
        cluster: Cluster = state.cluster
        cluster.ensure_queue(session.oid)

        async def publisher():
            """while session.oid in cluster.event_queues.keys():
            event: EventType = await cluster.event_queues[session.oid].get()
            yield encode(event)"""
            while True:
                yield encode({"event": "test", "data": {}, "dispatched": time.time()})
                time.sleep(2)

        return EventSourceResponse(publisher())
