from pydantic import BaseModel
from starlite import Controller, State, post
from models import Session, User
from util import exceptions


class AccountModel(BaseModel):
    username: str
    password: str


class SessionModel(BaseModel):
    sessionId: str
    userId: str


class AccountController(Controller):
    path = "/account"

    @post()
    async def login(self, data: AccountModel, state: State) -> SessionModel:
        session = Session.login(
            data.username, data.password, state.database
        )  # Raises BadLoginException
        session.save()
        return {"sessionId": session.oid, "userId": session.uid}

    @post("/create")
    async def create_account(self, data: AccountModel, state: State) -> SessionModel:
        new_user = User.new(
            data.username, data.password, database=state.database
        )  # Raises UserExistsException
        new_user.save()

        session = Session.login(data.username, data.password, state.database)
        session.save()
        return {"sessionId": session.oid, "userId": session.uid}
