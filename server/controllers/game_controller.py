from time import time
from typing import Dict, List, Optional
from pydantic import BaseModel
from starlite import Controller, State, delete, get, patch, post, Provide
from starlite.types import Guard
from util import (
    guard_loggedIn,
    exceptions,
    session_dep,
    guard_isGameOwner,
    guard_isGameParticipant,
    game_dep,
)
from models import Session, Game, User, Invite
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
    plugins: List[str]
    game_master: str


class InviteRequestModel(BaseModel):
    use_limit: Optional[int] = None  # Number of uses before expiration
    expire_length: Optional[int] = None  # Number of seconds before expiration


class InviteModel(BaseModel):
    code: str
    uses_remaining: int | None  # Number of uses remaining, or None for unlimited
    expiration: int | None  # Unix timestamp (seconds)


class InvitePatchModel(BaseModel):
    uses_remaining: int | None
    expiration: int | None


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
        games_raw: List[Game] = [
            g.set_loader(state.plugins)
            for g in Game.load_multiple_from_query(
                {
                    "$or": [
                        {"owner_id": session.uid},
                        {"participants": {"$all": [session.uid]}},
                    ]
                },
                state.database,
            )
        ]

        owners_raw: List[User] = User.load_multiple_from_query(
            {"oid": {"$in": [g.owner_id for g in games_raw]}}, state.database
        )
        owner_mapping: Dict[str, User] = {o.oid: o for o in owners_raw}

        return [
            MinimalGameModel(
                id=g.oid,
                name=g.name,
                owner_id=g.owner_id,
                owner_name=owner_mapping[g.owner_id].display_name
                if owner_mapping[g.owner_id].display_name
                else owner_mapping[g.owner_id].username,
                system=state.plugins[g.system].display_name,
                image=g.image,
                participants=g.participants,
                plugins=[i.display_name for i in g.enumerate_plugins().values()],
                game_master=g.game_master,
            )
            for g in games_raw
        ]

    @post("/join/{invite:str}", status_code=HTTP_202_ACCEPTED)
    async def join_game(self, invite: str, session: Session, state: State) -> None:
        invites: List[Invite] = Invite.load_multiple_from_query(
            {"code": invite}, state.database
        )

        if len(invites) == 0:
            raise exceptions.InviteNotFound()

        invite: Invite = invites[0]
        if invite.uses_remaining == 0 or invite.expiration <= time():
            state.database[Invite.collection].delete_many(
                {"code": invite, "game_id": invite.game_id}
            )
            raise exceptions.InviteNotFound()

        game: Game = Game.load_oid(invite.game_id, state.database)
        if session.uid == game.owner_id or session.uid in game.participants:
            raise exceptions.InviteForJoinedGame()

        game.participants.append(session.uid)
        game.save()

        invite.uses_remaining -= 1
        invite.save()
        return None


class GameSpecificController(Controller):
    path: str = "/games/{game_id:str}"
    guards: Optional[List[Guard]] = [guard_loggedIn]
    dependencies: Optional[Dict[str, "Provide"]] = {
        "session": Provide(session_dep),
        "game": Provide(game_dep),
    }

    @post("/invites", guards=[guard_isGameOwner])
    async def create_invite(
        self, data: InviteRequestModel, state: State, session: Session, game: Game
    ) -> InviteModel:
        invite: Invite = Invite.new(
            state.database, game.oid, data.use_limit, data.expire_length
        )
        invite.save()
        return InviteModel(
            code=invite.code,
            uses_remaining=invite.uses_remaining,
            expiration=invite.expiration,
        )

    @delete("/invites/{code:str}", guards=[guard_isGameOwner])
    async def delete_invite(
        self, code: str, state: State, session: Session, game: Game
    ) -> None:
        invites: List[Invite] = Invite.load_multiple_from_query(
            {"code": code, "game_id": game.oid}, state.database
        )

        if len(invites) == 0:
            raise exceptions.InviteNotFound()

        state.database[Invite.collection].delete_many(
            {"code": code, "game_id": game.oid}
        )

    @patch("/invites/{code:str}", guards=[guard_isGameOwner])
    async def edit_invite(
        self,
        code: str,
        data: InvitePatchModel,
        state: State,
        session: Session,
        game: Game,
    ) -> InviteModel:
        invites: List[Invite] = Invite.load_multiple_from_query(
            {"code": code, "game_id": game.oid}, state.database
        )

        if len(invites) == 0:
            raise exceptions.InviteNotFound()

        invite = invites[0]
        invite.expiration = data.expiration
        invite.uses_remaining = data.uses_remaining
        invite.save()
        return InviteModel(
            code=invite.code,
            uses_remaining=invite.uses_remaining,
            expiration=invite.expiration,
        )
