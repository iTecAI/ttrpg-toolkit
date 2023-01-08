from typing import Dict, Union
from pydantic import BaseModel, validator


class DataSearchFieldModel(BaseModel):
    field_type: str
    value: Union[str, list[str]]
    exact: bool = False  # Only used for string types
    comparator: str = "="  # Only used for number types

    @validator("field_type")
    def validate_field_type(cls, v):
        accept = ["string", "number", "boolean", "select"]
        if not v in accept:
            raise ValueError(f"field_type must be one of [{', '.join(accept)}]")
        return v

    @validator("comparator")
    def validate_comparator(cls, v):
        accept = ["<", "<=", "=", ">=", ">", "!="]
        if not v in accept:
            raise ValueError(f"comparator must be one of [{', '.join(accept)}]")
        return v


class DataSearchModel(BaseModel):
    category: str
    all_required: bool = False
    fields: Dict[str, Union[DataSearchFieldModel, str]]
