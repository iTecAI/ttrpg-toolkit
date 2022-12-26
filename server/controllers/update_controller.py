from starlite import Controller, get, post, State, Provide, Request, delete
from starlite.response import StreamingResponse
from util import Cluster, Session, session_dep, guard_loggedIn
from util.exceptions import AuthorizationFailedError
from typing import TypedDict, Any, Optional
import asyncio
import json
from pydantic import BaseModel
from asyncio.queues import QueueEmpty
from asyncio import sleep
from sse_starlette.sse import EventSourceResponse
from httpagentparser import detect


class EventType(TypedDict):
    event: str
    data: dict[str, Any]
    dispatched: float


class PollEvent(BaseModel):
    event: str
    body: Optional[dict[str, Any]] = None


class UpdateController(Controller):
    path: str = "/updates"

    @staticmethod
    def encode(data: Any) -> str:
        return json.dumps(data)

    @staticmethod
    async def flush(request: Request):
        await request.send(
            {
                "type": "http.response.body",
                "body": f": {'.' * 2048 ** 2}\n\n".encode(),
                "more_body": True,
            }
        )

    @get("/poll/{session:str}")
    async def poll(
        self, session: str, state: State, request: Request
    ) -> EventSourceResponse:
        session_obj = Session.load_oid(session, state.database)
        if session_obj == None:
            raise AuthorizationFailedError()
        cluster: Cluster = state.cluster
        cluster.ensure_queue(session_obj.oid)

        async def publisher(request: Request, session_id: str):
            ua = detect(request.headers["User-Agent"], fill_none=True)
            try:
                if (
                    ua["browser"]
                    and ua["browser"]["name"]
                    and ua["browser"]["name"].lower() == "firefox"
                ):
                    await self.flush(request)
                yield self.encode([])
                while (
                    request.is_connected and session_id in cluster.event_queues.keys()
                ):
                    if cluster.event_queues[session_id].empty():
                        pass
                    else:
                        out = []
                        while not cluster.event_queues[session_id].empty():
                            out.append(cluster.event_queues[session_id].get_nowait())

                        yield self.encode(out)
                    await asyncio.sleep(0.5)
            except Exception as e:
                raise e

        return EventSourceResponse(
            publisher(request, session_obj.oid),
            headers={"Cache-Control": "public, max-age=29, no-transform"},
            media_type="text/event-stream;charset=utf-8",
        )

    @delete(
        "/poll", guards=[guard_loggedIn], dependencies={"session": Provide(session_dep)}
    )
    async def close_update_connection(self, session: Session, state: State) -> None:
        cluster: Cluster = state.cluster
        if session.oid in cluster.event_queues.keys():
            del cluster.event_queues[session.oid]

        return None
