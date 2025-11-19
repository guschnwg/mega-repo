from datetime import datetime
import json
from typing import Any, TypeVar

import pydantic

from utils import get_raw_types


class BaseClass(pydantic.BaseModel):
    @pydantic.field_validator("*", mode="before")
    @classmethod
    def decode_json_strings(cls, value, info):
        the_type = cls.model_fields[info.field_name].annotation
        t = get_raw_types(the_type)

        if list in t or dict in t:
            return json.loads(value)
        if datetime in t:
            return datetime.strptime(value, "%Y-%m-%d %H:%M:%S.%f")
        if bool in t:
            return bool(value)

        return value

    @pydantic.field_serializer("*")
    @classmethod
    def serializer(cls, value, info):
        if isinstance(value, datetime):
            return datetime.strftime(value, "%Y-%m-%d %H:%M:%S.%f")

        return value

    @classmethod
    def parse(cls, fields: list[str], data: Any):
        if not data:
            return None

        return cls(**dict(zip(fields, data)))

    @classmethod
    def parse_many(cls, fields: list[str], data: Any):
        if not data:
            data = []

        return [cls.parse(fields, d) for d in data]

BaseClassType = TypeVar('BaseClassType', bound=BaseClass)
