from typing import Optional, TypedDict
from pydantic import BaseModel
from starlite import Controller, Provide, State, post, get
from models import Session, User
from util import guards, Cluster
from util import exceptions, guard_loggedIn, session_dep
from starlette.status import *


class AccountModel(BaseModel):
    username: str
    password: str


class SessionModel(BaseModel):
    sessionId: str
    userId: str


class AccountInfoModel(BaseModel):
    userId: str
    username: str
    displayName: str


class EditAccountModel(BaseModel):
    displayName: Optional[str] = None


class AccountSearchResult(TypedDict):
    uid: str
    email: str
    display: str


class AccountController(Controller):
    path = "/account"

    @post()
    async def login(self, data: AccountModel, state: State) -> SessionModel:
        session = Session.login(
            data.username, data.password, state.database, state.cluster.node_id
        )  # Raises BadLoginException
        session.save()
        return {"sessionId": session.oid, "userId": session.uid}

    @get(guards=[guard_loggedIn], dependencies={"session": Provide(session_dep)})
    async def get_account_info(
        self, state: State, session: Session | None
    ) -> AccountInfoModel:
        if session == None:
            raise exceptions.AuthorizationFailedError()
        return {
            "userId": session.uid,
            "username": session.user.username,
            "displayName": session.user.display_name
            if session.user.display_name
            else session.user.username,
        }

    @get("/{uid:str}", guards=[guard_loggedIn])
    async def get_specific_acct_info(self, state: State, uid: str) -> AccountInfoModel:
        user: User = User.load_oid(uid, state.database)
        if user == None:
            raise exceptions.UserDoesNotExistError()

        return {
            "userId": user.oid,
            "username": user.username,
            "displayName": user.display_name if user.display_name else user.username,
        }

    @post("/create")
    async def create_account(self, data: AccountModel, state: State) -> SessionModel:
        new_user = User.new(
            data.username, data.password, database=state.database
        )  # Raises UserExistsException
        new_user.save()

        cluster: Cluster = state.cluster

        session = Session.login(
            data.username, data.password, state.database, cluster.node_id
        )
        session.save()
        return {"sessionId": session.oid, "userId": session.uid}

    @post(
        "/logout",
        guards=[guard_loggedIn],
        dependencies={"session": Provide(session_dep)},
    )
    async def logout(self, state: State, session: Session | None) -> None:
        if session == None:
            raise exceptions.AuthorizationFailedError()
        state.database[Session.collection].delete_many({"oid": session.oid})

    @post(
        "/edit",
        status_code=HTTP_202_ACCEPTED,
        guards=[guard_loggedIn],
        dependencies={"session": Provide(session_dep)},
    )
    async def edit_account(
        self, state: State, session: Session, data: EditAccountModel
    ) -> None:
        user = session.user
        if data.displayName:
            user.display_name = data.displayName

        user.save()
        return None

    @get("/search", guards=[guard_loggedIn])
    async def search_users(self, state: State, q: str) -> list[AccountSearchResult]:
        users: list[User] = User.load_multiple_from_query(
            {
                "$or": [
                    {"username": {"$regex": f"^{q}.*", "$options": "i"}},
                    {"display_name": {"$regex": f"^{q}.*", "$options": "i"}},
                ]
            },
            state.database,
        )
        return [
            {"uid": u.oid, "email": u.username, "display": u.display_name}
            for u in users
        ]
