from typing import Optional
from pydantic import BaseModel
from starlite import Controller, Provide, State, post, get
from models import Session, User
from util import guards
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


class AccountController(Controller):
    path = "/account"

    @post()
    async def login(self, data: AccountModel, state: State) -> SessionModel:
        session = Session.login(
            data.username, data.password, state.database
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

    @post("/create")
    async def create_account(self, data: AccountModel, state: State) -> SessionModel:
        new_user = User.new(
            data.username, data.password, database=state.database
        )  # Raises UserExistsException
        new_user.save()

        session = Session.login(data.username, data.password, state.database)
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
