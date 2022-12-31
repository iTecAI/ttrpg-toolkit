from .config import Config
from models import Session, User
from pymongo.database import Database
from asyncio import Queue
from typing import TypedDict, Union, Any
from time import time


class Update(TypedDict):
    session: Union[str, list[str]]
    update: str
    data: dict[str, Any]


class Cluster:
    def __init__(self, conf: Config, db: Database) -> None:
        self.nodes = conf["cluster"]
        self.node_id = conf["cluster_id"]
        self.database = db
        self.sessions = db[Session.collection]
        self.event_queues: dict[str, Queue] = {}

    def ensure_queue(self, session: str):
        if not session in self.event_queues.keys():
            self.event_queues[session] = Queue()

    def dispatch_update(
        self, sessions: Union[str, list[str]], event: str, data: Any = {}
    ):
        sessions: list[str] = []
        if type(sessions) == list:
            sessions = sessions
        else:
            sessions = [sessions]

        active_sessions = [s for s in self.sessions.find({"oid": {"$in": sessions}})]
        for a in active_sessions:
            if a["node_id"] == self.node_id:
                self.ensure_queue(a["oid"])
                self.event_queues[a["oid"]].put_nowait(
                    {
                        "event": event,
                        "data": data,
                        "dispatched": time(),
                    }
                )
