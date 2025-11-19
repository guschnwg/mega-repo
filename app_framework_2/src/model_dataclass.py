from dataclasses import dataclass
from datetime import datetime
import json
from typing import Any, TypeVar

from utils import get_raw_types


@dataclass
class BaseClass:
    def __post_init__(self):
        for key, field in self.__dataclass_fields__.items():
            t = get_raw_types(field.type)
            val = getattr(self, key)
            if not val:
                continue

            if list in t or dict in t:
                setattr(self, key, json.loads(val))
            elif datetime in t:
                setattr(self, key, datetime.strptime(val, "%Y-%m-%d %H:%M:%S.%f"))
            elif bool in t:
                setattr(self, key, bool(val))

    def __bool__(self):
        return True

    @classmethod
    def parse(cls, fields: list[str], data: Any):
        if not data:
            return None

        return cls(**dict(zip(fields, data)))

    @classmethod
    def parse_many(cls, fields: list[str], data: Any):
        if not data:
            data = []

        return [cls(**dict(zip(fields, d))) for d in data]

BaseClassType = TypeVar('BaseClassType', bound=BaseClass)
