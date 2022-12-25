from starlite import Controller, get, post, State, Provide, Request
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


async def flush(request: Request):
    CHUNK = "." * 8192**2
    await request.send(
        {
            "type": "http.response.body",
            "body": f": {CHUNK}\n\n".encode(),
            "more_body": True,
        }
    )


class UpdateController(Controller):
    path: str = "/updates"

    @get("/subscribe/{sessionId:str}")
    async def subscribe(
        self, state: State, sessionId: str, request: Request
    ) -> EventSourceResponse:
        session = Session.load_oid(sessionId, state.database)
        if session == None:
            raise AuthorizationFailedError()
        cluster: Cluster = state.cluster
        cluster.ensure_queue(session.oid)

        async def publisher(req: Request):
            """while session.oid in cluster.event_queues.keys():
            event: EventType = await cluster.event_queues[session.oid].get()
            yield encode(event)"""
            while True:
                await flush(req)
                yield encode({"event": "test", "data": {}, "dispatched": time.time()})
                time.sleep(2)

        gen = publisher(request)
        return EventSourceResponse(gen)
