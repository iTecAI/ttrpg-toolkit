import json
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
        self.detail = json.dumps(
            {
                "errorType": HTTPStatus(self.status_code).phrase,
                "message": self.message,
                "messageClass": self.message_class,
                "extra": extra,
            }
        )

    def __repr__(self) -> str:
        return f"{self.status_code} - {self.__class__.__name__} - {self.message}"


# Internal errors
class ResourceError(BaseException):
    message: str = "Failed to access resource:"
    message_class: str = "error.internal.resource"

    def __init__(self, extra: str) -> None:
        super().__init__(extra=extra)


class GenericNetworkError(BaseHTTPException):
    message: str = "An unexpected network error occurred:"
    message_class: str = "error.internal.generic_network"
    status_code: int = HTTP_500_INTERNAL_SERVER_ERROR


class PluginLibraryError(BaseException):
    message: str = "Failed to install one or more libraries."
    message_class: str = "error.plugin.library"


class PluginDoesNotExistError(BaseException):
    message: str = "Failed to locate plugin:"
    message_class: str = "error.plugin.missing"


class InvalidPluginError(BaseException):
    message: str = "Plugin is invalid:"
    message_class: str = "error.plugin.invalid"


class PluginDependencyError(BaseException):
    message: str = "Plugins are missing required dependencies."
    message_class: str = "error.plugin.dependency"


class PluginEntrypointError(BaseException):
    message: str = "Failed to load entrypoint:"
    message_class: str = "error.plugin.entrypoint_failure"


class PluginDataLoaderError(BaseException):
    message: str = "Failed to load data from data loader:"
    message_class: str = "error.plugin.data_source"


class PluginDataArgumentError(BaseException):
    message: str = "Incorrect arguments passed to data loader:"
    message_class: str = "error.plugin.data_args"


class PluginNoDataSourceError(BaseHTTPException):
    message: str = "Plugin is not a data source"
    message_class: str = "error.plugin.not_data_source"
    status_code: int = HTTP_405_METHOD_NOT_ALLOWED


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


class PermissionError(BaseHTTPException):
    message: str = "You do not have permission to access this resource"
    message_class: str = "error.account.permission"
    status_code: int = HTTP_403_FORBIDDEN


# Authorization errors
class AuthorizationFailedError(BaseHTTPException):
    message: str = "Failed to authorize with token"
    message_class: str = "error.auth.generic"
    status_code: int = HTTP_401_UNAUTHORIZED


# Game Errors
class GameNotOwned(BaseHTTPException):
    message: str = "You do not own this game"
    message_class: str = "error.games.not_owned"
    status_code: int = HTTP_403_FORBIDDEN


class GameNotFound(BaseHTTPException):
    message: str = "Game not found"
    message_class: str = "error.games.not_found"
    status_code: int = HTTP_404_NOT_FOUND


class InviteNotFound(BaseHTTPException):
    message: str = "Invite not found"
    message_class: str = "error.invites.not_found"
    status_code: int = HTTP_404_NOT_FOUND


class InviteForJoinedGame(BaseHTTPException):
    message: str = "Specified invite references a game that user is in"
    message_class: str = "error.invites.in_game"
    status_code: int = HTTP_405_METHOD_NOT_ALLOWED


# Data Source Errors
class DataSourceCategoryNotFound(BaseHTTPException):
    message: str = "Category not found:"
    message_class: str = "error.data_source.category"
    status_code: int = HTTP_404_NOT_FOUND


# Debug Exceptions
class DebugNotActiveError(BaseHTTPException):
    message: str = "Debug mode is not active"
    message_class: str = "error.debug.not_active"
    status_code: int = HTTP_405_METHOD_NOT_ALLOWED


# User Content Errors
class ContentNotFoundError(BaseHTTPException):
    message: str = "User content not found:"
    message_class: str = "error.user_content.not_found"
    status_code: int = HTTP_404_NOT_FOUND


# Content Errors
class ContentItemNotFoundError(BaseHTTPException):
    message: str = "Content item not found:"
    message_class: str = "error.content.not_found"
    status_code: int = HTTP_404_NOT_FOUND


class InvalidContentTypeError(BaseHTTPException):
    message = "Invalid content type:"
    message_class = "error.content.type"
    status_code = HTTP_405_METHOD_NOT_ALLOWED


class InvalidContentArgumentsError(BaseHTTPException):
    message = "The arguments provided to create/modify content were invalid:"
    message_class = "error.content.arguments"
    status_code = HTTP_400_BAD_REQUEST


class InvalidContentSettingError(BaseHTTPException):
    message = "Invalid setting:"
    message_class = "error.content.setting"
    status_code = HTTP_405_METHOD_NOT_ALLOWED
