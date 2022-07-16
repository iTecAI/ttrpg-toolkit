from typing import Any, Dict, List


def get_nested(data: Dict[Any, Any], path: List[Any]) -> Any:
    current = data.copy()
    while len(path) > 0:
        key = path.pop(0)
        try:
            current = current[key]
        except KeyError:
            raise KeyError(f"Failed to get nested key {key}")
    return current
