from starlite import Controller, get, post, State, Provide, Request
from starlite.response import StreamingResponse
from util import Cluster, Session
from util.exceptions import AuthorizationFailedError
from typing import TypedDict, Any
import json
import time
from sse_starlette.sse import EventSourceResponse
from asyncio.queues import QueueEmpty


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
            while session.oid in cluster.event_queues.keys():
                try:
                    event: EventType = cluster.event_queues[session.oid].get_nowait()
                    print(event)
                    await flush(req)
                    yield encode(event)
                except QueueEmpty:
                    if round(time.time()) % 30 == 0:
                        await flush(req)
                        yield encode(f"ping {time.ctime()}")

                time.sleep(0.25)

        gen = publisher(request)
        return EventSourceResponse(gen)
