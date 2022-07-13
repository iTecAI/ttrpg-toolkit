from typing import Any, Dict, List, Tuple
from util import plugin_utils
from starlite import State
import d20
import random


class D20API:
    @staticmethod
    def roll(roll_string: str):
        return d20.roll(roll_string).total


class D20Controller(plugin_utils.BaseDiceController):
    path: str = "/"
    dice_types: List[str] = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"]

    @classmethod
    def roll_segment(cls, segment: plugin_utils.DiceSegmentModel) -> Tuple[int, str]:
        dtype = int(segment.dieType.split("d")[1])
        parts = [random.randint(1, dtype) for i in range(segment.count)]
        total = sum(parts)
        return (
            total if segment.operator == "+" else -1 * total,
            f" {segment.operator} {segment.count}d{dtype}: ("
            + ", ".join(parts.map(str))
            + ")",
        )

    @classmethod
    def roll_object(
        cls, dice_object: plugin_utils.DiceObjectModel, state: State
    ) -> plugin_utils.SummaryModel:
        results: List[Any] = []
        result_vals: List[int] = []
        for i in range(dice_object.rerolls):
            segments = []
            for s in dice_object.parts:
                if isinstance(s, plugin_utils.DiceSegmentModel):
                    total, summary = cls.roll_segment(s)
                else:
                    total = (1 if s.operator == "+" else -1) * s.value
                    summary = f" {s.operator} {s.value}"
                segments.append({"value": total, "summary": summary})

            sum_val = sum([s["value"] for s in segments])
            results.append(
                {
                    "result": sum_val,
                    "summary": "".join([s["summary"] for s in segments]).strip(" +"),
                }
            )
            result_vals.append(sum_val)

        if dice_object.rerolls > 1 and dice_object.rerollOperation != None:
            if dice_object.rerollOperation == "min":
                return results[result_vals.index(min(result_vals))]
            else:
                return results[result_vals.index(max(result_vals))]
        else:
            return results[0]

    @classmethod
    def roll_string(
        cls, dice_string: plugin_utils.DiceStringModel, state: State
    ) -> plugin_utils.SummaryModel:
        results = []
        result_vals = []
        for i in range(dice_string.rerolls):
            roll = d20.roll(dice_string.string)
            results.append({"result": roll.total, "summary": str(roll)})
            result_vals.append(roll.total)

        if dice_string.rerolls > 1 and dice_string.rerollOperation != None:
            if dice_string.rerollOperation == "min":
                return results[result_vals.index(min(result_vals))]
            else:
                return results[result_vals.index(max(result_vals))]
        else:
            return results[0]
