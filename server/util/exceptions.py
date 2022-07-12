from starlite.exceptions import HTTPException
from starlette.status import *
from http import HTTPStatus


class BaseException(Exception):
    message: str = "Unexpected error occurred"
    message_class: str = "error.base"

    def __init__(self, extra: str = "") -> None:
        self.extra = extra
        super().__init__(self.message + (" " + extra if len(extra) > 0 else ""))


class BaseHTTPException(BaseException, HTTPException):
    message: str = "Unexpected network error occurred"
    message_class: str = "error.base_network"
    status_code: int = HTTP_500_INTERNAL_SERVER_ERROR

    def __init__(self, status_code: int = None, extra: str = "") -> None:
        super().__init__(extra)
        if status_code:
            self.status_code = status_code
        self.detail = {
            "errorType": HTTPStatus(self.status_code).phrase,
            "message": self.message,
            "messageClass": self.message_class,
            "extra": extra,
        }

    def __repr__(self) -> str:
        return f"{self.status_code} - {self.__class__.__name__} - {self.message}"


# Internal errors
class ResourceError(BaseException):
    message: str = "Failed to access resource:"
    message_class: str = "error.internal.resource"

    def __init__(self, extra: str) -> None:
        super().__init__(extra=extra)


# Account errors
class UserExistsError(BaseHTTPException):
    message: str = "User already exists"
    message_class: str = "error.account.user_exists"
    status_code: int = HTTP_409_CONFLICT


class UserDoesNotExistError(BaseException):
    message: str = "User does not exist"
    message_class: str = "error.account.user_nonexistent"


class BadLoginError(BaseHTTPException):
    message: str = "Bad login attempt"
    message_class: str = "error.account.login_failed"
    status_code: int = HTTP_401_UNAUTHORIZED


# Authorization errors
class AuthorizationFailedError(BaseHTTPException):
    message: str = "Failed to authorize with token"
    message_class: str = "error.auth.generic"
    status_code: int = HTTP_401_UNAUTHORIZED
