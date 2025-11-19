from typing import get_origin, get_args


def get_raw_types(the_type):
    the_args = get_args(the_type)
    the_args = [the_type] if len(the_args) in [0, 1] else the_args
    the_args = [a for a in the_args if a is not type(None)]
    return [get_origin(a) or a for a in the_args]

assert get_raw_types(bool) == [bool]
assert get_raw_types(list[bool]) == [list]
assert get_raw_types(list[bool] | None) == [list]
assert get_raw_types(list) == [list]
assert get_raw_types(list | None) == [list]