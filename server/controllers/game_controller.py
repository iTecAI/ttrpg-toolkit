from typing import Dict, List, Optional
from pydantic import BaseModel
from starlite import Controller, State, get, post, Provide
from starlite.types import Guard
from util import guard_loggedIn, exceptions, session_dep
from models import Session, Game, User
from starlette.status import *


class GameCreateModel(BaseModel):
    name: str
    system: str
    plugins: List[str]


class MinimalGameModel(BaseModel):
    id: str
    name: str
    owner_id: str
    owner_name: str
    system: str
    image: str
    participants: List[str]


class GameController(Controller):
    path: str = "/games"
    guards: Optional[List[Guard]] = [guard_loggedIn]
    dependencies: Optional[Dict[str, "Provide"]] = {"session": Provide(session_dep)}

    @post("/")
    async def create_game(
        self, state: State, session: Session, data: GameCreateModel
    ) -> str:
        new_game: Game = Game.create(
            state.database,
            state.plugins,
            session.uid,
            data.name,
            data.system,
            data.plugins,
        )
        new_game.save()
        return new_game.oid

    @get("/")
    async def list_games(
        self, state: State, session: Session
    ) -> List[MinimalGameModel]:
        games_raw: List[Game] = Game.load_multiple_from_query(
            {
                "$or": [
                    {"owner_id": session.uid},
                    {"participants": {"$all": [session.uid]}},
                ]
            },
            state.database,
        )

        owners_raw: List[User] = User.load_multiple_from_query(
            {"oid": {"$in": [g.owner_id for g in games_raw]}}, state.database
        )
        owner_mapping: Dict[str, User] = {o.oid: o for o in owners_raw}

        return [
            MinimalGameModel(
                id=g.oid,
                name=g.name,
                owner_id=g.owner_id,
                owner_name=owner_mapping[g.owner_id].username,
                system=state.plugins[g.system].display_name,
                image=g.image,
                participants=g.participants,
            )
            for g in games_raw
        ]
