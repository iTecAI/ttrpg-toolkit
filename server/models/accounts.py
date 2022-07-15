from typing import Dict
from util import ORM, exceptions
from pymongo.database import Database
import time
import bcrypt
from base64 import urlsafe_b64encode, urlsafe_b64decode


class User(ORM):
    collection: str = "users"
    object_type: str = "User"

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        username: str = None,
        password_hash: str = None,
        **kwargs
    ):
        super().__init__(oid, database, **kwargs)
        self.username = username
        self.password_hash = password_hash

    @classmethod
    def new(cls, username: str, password: str, database: Database):
        if len(cls.load_multiple_from_query({"username": username}, database)) > 0:
            raise exceptions.UserExistsError()
        encoded_psw = password.encode("utf-8")
        hashed_psw = bcrypt.hashpw(encoded_psw, bcrypt.gensalt())
        b64_psw = urlsafe_b64encode(hashed_psw).decode("utf-8")

        return cls(database=database, username=username, password_hash=b64_psw)

    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(
            password.encode("utf-8"), urlsafe_b64decode(self.password_hash)
        )


class Session(ORM):
    SESSION_EXPIRE = 24 * 3600  # Seconds before session expires
    collection: str = "sessions"
    object_type: str = "Session"

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        uid: str = None,
        expiration: float = 0,
        **kwargs
    ):
        super().__init__(oid, database, **kwargs)
        self.uid = uid
        self.expiration = expiration

    @property
    def valid(self) -> bool:
        return time.time() < self.expiration

    def refresh(self) -> None:
        self.expiration = time.time() + self.SESSION_EXPIRE

    @property
    def user(self) -> User:
        if not self.uid or self.database == None:
            raise exceptions.ResourceError(
                "Cannot determine user without specified UID and database"
            )
        user = User.load_oid(self.uid, self.database)
        if user:
            return user
        raise exceptions.UserDoesNotExistError()

    @classmethod
    def login(cls, username: str, password: str, database: Database):
        results = User.load_multiple_from_query({"username": username}, database)
        if len(results) == 0:
            raise exceptions.BadLoginError()
        user = results[0]
        valid_pw = user.check_password(password)
        if not valid_pw:
            raise exceptions.BadLoginError()

        database[cls.collection].delete_many({"uid": user.oid})

        return cls(
            database=database, uid=user.oid, expiration=time.time() + cls.SESSION_EXPIRE
        )
