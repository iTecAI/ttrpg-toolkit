import re
from typing import List


def parse_5etools_command(directive: str, arguments: List[str]):

    if directive == "filter":
        return arguments[0]
    if directive == "item":
        if len(arguments) < 3:
            return arguments[0]
        else:
            return arguments[2]
    if directive == "dice":
        return arguments[0].replace("×", "*")


def parse_5etools_string(string: str):
    segments = re.findall("\{@.*? .*?\}", string)

    for n in range(len(segments)):
        command = segments[n].strip("{@}")
        directive = command.split(" ", maxsplit=1)[0]
        arguments = command.split(" ", maxsplit=1)[1].split("|")
        string = string.replace(
            segments[n], parse_5etools_command(directive, arguments), 1
        )

    return string
