from logging import exception
from typing import Any, List, Optional
from pydantic import BaseModel
from starlite import State, Controller, post
from starlette.status import *
from starlite.types import Guard
from ..exceptions import *
from ..guards import guard_loggedIn


class DiceSegmentModel(BaseModel):
    operator: Optional[str] = "+"
    count: Optional[int] = 1
    dieType: str


class StaticSegmentModel(BaseModel):
    operator: Optional[str] = "+"
    value: Any


class DiceObjectModel(BaseModel):
    parts: List[DiceSegmentModel | StaticSegmentModel]
    rerolls: Optional[int] = 1
    rerollOperation: Optional[str | None] = None


class DiceStringModel(BaseModel):
    string: str
    rerolls: Optional[int] = 1
    rerollOperation: Optional[str | None] = None


class SummaryModel(BaseModel):
    result: Any
    summary: str


class DiceException(BaseHTTPException):
    message: str = "Incorrect dice syntax:"
    message_class: str = "plugins.dice.bad_syntax"
    status_code: int = HTTP_400_BAD_REQUEST


class BaseDiceController(Controller):
    guards: Optional[List[Guard]] = [guard_loggedIn]
    dice_types: List[str] = []

    @classmethod
    def roll_object(cls, dice_object: DiceObjectModel, state: State) -> SummaryModel:
        raise DiceException(extra="This method is not implemented")

    @classmethod
    def roll_string(cls, dice_string: DiceStringModel, state: State) -> SummaryModel:
        raise DiceException(extra="This method is not implemented")

    @post("/roll_object", status_code=HTTP_200_OK)
    async def _roll_object_endpoint(
        self, state: State, data: DiceObjectModel
    ) -> SummaryModel:
        if data.rerolls < 1:
            raise DiceException(extra="Dice must be rolled at least once")
        try:
            return self.roll_object(data, state)
        except:
            exception("Failed to roll:\n")
            raise DiceException(extra="Error rolling dice")

    @post("/roll_string", status_code=HTTP_200_OK)
    async def _roll_string_endpoint(
        self, state: State, data: DiceStringModel
    ) -> SummaryModel:
        if data.rerolls < 1:
            raise DiceException(extra="Dice must be rolled at least once")
        try:
            return self.roll_string(data, state)
        except:
            exception("Failed to roll:\n")
            raise DiceException(extra="Error rolling dice")
