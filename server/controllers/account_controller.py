from pydantic import BaseModel
from starlite import Controller, Provide, State, post, get
from models import Session, User
from util import guards
from util import exceptions, guard_loggedIn, session_dep


class AccountModel(BaseModel):
    username: str
    password: str


class SessionModel(BaseModel):
    sessionId: str
    userId: str


class AccountInfoModel(BaseModel):
    userId: str
    username: str


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
        return {"userId": session.uid, "username": session.user.username}

    @post("/create")
    async def create_account(self, data: AccountModel, state: State) -> SessionModel:
        new_user = User.new(
            data.username, data.password, database=state.database
        )  # Raises UserExistsException
        new_user.save()

        session = Session.login(data.username, data.password, state.database)
        session.save()
        return {"sessionId": session.oid, "userId": session.uid}
