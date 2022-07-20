from typing import Any, Dict, List


def get_nested(data: Dict[Any, Any], path: List[Any]) -> Any:
    if type(path) == str:
        path = path.split(".")
    current = data.copy()
    while len(path) > 0:
        key = path.pop(0)
        try:
            current = current[key]
        except KeyError:
            raise KeyError(f"Failed to get nested key {key}")
    return current


def search(term: str, items: List[Any], getitem=None) -> List[Any]:
    results = []
    for i in items:
        if getitem:
            val = getitem(i)
        else:
            val = i

        if val.lower() in term.lower() or term.lower() in val.lower():
            results.append(i)

    return results
