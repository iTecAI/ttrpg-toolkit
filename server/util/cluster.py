from .config import Config
from models import Session, User
from pymongo.database import Database


class Cluster:
    def __init__(self, conf: Config, db: Database) -> None:
        self.nodes = conf["cluster"]
        self.node_id = conf["cluster_id"]
        self.database = db
        self.sessions = db[Session.collection]
