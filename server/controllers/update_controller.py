from starlite import Controller, get, post, State, Provide, Request
from starlite.response import StreamingResponse
from util import Cluster, Session, session_dep, guard_loggedIn
from util.exceptions import AuthorizationFailedError
from typing import TypedDict, Any, Optional
import json
import time
from pydantic import BaseModel
from asyncio.queues import QueueEmpty
from asyncio import sleep


class EventType(TypedDict):
    event: str
    data: dict[str, Any]
    dispatched: float


class PollEvent(BaseModel):
    event: str
    body: Optional[dict[str, Any]] = None


class UpdateController(Controller):
    path: str = "/updates"

    @get(
        "/poll", guards=[guard_loggedIn], dependencies={"session": Provide(session_dep)}
    )
    async def poll(self, session: Session, state: State, request: Request) -> PollEvent:
        cluster: Cluster = state.cluster
        cluster.ensure_queue(session.oid)

        while request.is_connected:
            try:
                event: EventType = cluster.event_queues[session.oid].get_nowait()
                break
            except QueueEmpty:
                pass
            await sleep(0.5)

        return PollEvent(
            event=event["event"],
            body=event["data"] if len(event["data"].keys()) > 0 else None,
        )
