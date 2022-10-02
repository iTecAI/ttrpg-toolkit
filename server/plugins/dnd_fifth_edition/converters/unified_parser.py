import json
from conv_util import *
import logging


class Parser5e:
    TYPE_MAP = {
        "section": "entrySection",
        "entries": "entryEntries",
        "quote": "entryQuote",
        "inline": "entryInlineEntries",
        "inlineBlock": "entryEntriesInlineEntries",
        "options": "entryOptions",
        "table": "entryTable",
        "tableGroup": "entryTableGroup",
        "row": "entryTableRow",
        "cell": "entryTableCell",
        "list": "entryList",
        "bonus": "entryBonus",
        "dice": "entryDice",
        "abilityDc": "entryAbilityDc",
        "abilityAttackMod": "entryAbilityAttackMod",
        "abilityGeneric": "abilityGeneric",
        "link": "entryLink",
        "optfeature": "entryOptFeature",
        "inset": "entryInset",
        "insetReadaloud": "entryInsetReadAloud",
        "variant": "entryVariant",
        "variantInner": "entryVariantInner",
        "variantSub": "entryVariantSub",
        "itemSub": "entryItemSub",
        "itemSpell": "entryItemSpell",
        "image": "entryImage",
        "gallery": "entryGallery",
        "actions": "entryActions",
        "attack": "entryAttack",
        "flowchart": "entryFlowchart",
        "flowBlock": "entryFlowBlock",
        "ingredient": "entryIngredient",
        "refClassFeature": "entryRefClassFeature",
        "refSubclassFeature": "entryRefSubclassFeature",
        "refOptionalFeature": "entryRefOptionalFeature",
        "hr": "entryHr",
        "wrapper": "entryWrapped",
        "item": "entryItem",
    }

    def parseList(self, data: dict):
        out = ["### " + data["name"]] if "name" in data.keys() else []
        out.extend([" - " + i for i in self.parse(data["items"])])
        out.append("")
        return out

    def parseTable(self, data: dict):
        out = ["### " + data["name"]] if "name" in data.keys() else []
        if "colLabels" in data.keys():
            headers = []
            header_styles = []
            for h in range(len(data["colLabels"])):
                headers.append(data["colLabels"][h])
                st = data["colStyles"][h]
                if "left" in st:
                    header_styles.append(":---")
                elif "right" in st:
                    header_styles.append("---:")
                elif "center" in st:
                    header_styles.append(":---:")
                else:
                    header_styles.append("---")
        else:
            headers = ["" for i in range(len(data["rows"]))]
            header_styles = ["---" for i in range(len(data["rows"]))]

        out.append(f"| {' | '.join(headers)} |")
        out.append(f"| {' | '.join(header_styles)} |")
        out.extend(["| " + " | ".join(self.parse(r)) + " |" for r in data["rows"]])
        if "caption" in data.keys():
            out.append("*" + parse_5etools_string(data["caption"]) + "*")
        out.append("")
        return out

    def parseInset(self, data: dict):
        out = ["### " + data["name"]] if "name" in data.keys() else []
        out.extend(["> " + i for i in self.parse(data["entries"])])
        out.append("")
        return out

    def parseItem(self, data: dict):
        out = []
        name = "**" + data["name"] + ":** " if "name" in data.keys() else ""
        if "entries" in data.keys():
            parsed = self.parse(data["entries"])
            out.append(name + parsed[0])
            out.extend(parsed[1:])
        else:
            out.append(name + parse_5etools_string(data["entry"]))
        out.append("")
        return out

    def __init__(self, data_directory: str):
        self.PARSERS = {
            "entrySection": self.parseItem,
            "entryEntries": self.parseItem,
            "entryHomebrew": None,
            "entryQuote": None,
            "entryInlineEntries": None,
            "entryEntriesInlineEntries": None,
            "entryOptions": None,
            "entryTableGroup": None,
            "entryTable": self.parseTable,
            "entryTableRow": None,
            "entryTableCell": None,
            "entryList": self.parseList,
            "entryBonus": None,
            "entryBonusSpeed": None,
            "entryDice": None,
            "entryAbilityDc": None,
            "entryAbilityAttackMod": None,
            "abilityGeneric": None,
            "entryLink": None,
            "entryOptFeature": None,
            "entryInset": self.parseInset,
            "entryInsetReadaloud": None,
            "entryVariant": None,
            "entryVariantInner": None,
            "entryVariantSub": None,
            "entryItem": self.parseItem,
            "entryItemSub": None,
            "entryItemSpell": self.parseItem,
            "entryImage": None,
            "entryGallery": None,
            "entryActions": None,
            "entryAttack": None,
            "entryStatblockInline": None,
            "entryStatblock": None,
            "entryRefClassFeature": None,
            "entryRefSubclassFeature": None,
            "entryRefOptionalfeature": None,
            "entryHr": None,
            "entrySpellcasting": None,
            "entryFlowchart": None,
            "entryFlowBlock": None,
            "entryIngredient": None,
            "entryWrapped": None,
        }
        self.data_directory = data_directory

    def map_type_to_renderer(self, data: dict):
        try:
            if "type" in data.keys() and data["type"] in self.TYPE_MAP:
                return self.PARSERS[self.TYPE_MAP[data["type"]]]
        except AttributeError:
            return "RAW"
        return "NF"

    def _parse_one(self, data: dict) -> list[str]:
        parser = self.map_type_to_renderer(data)
        if parser == "NF":
            logging.warning(
                f"Failed to parse entry\n\n{json.dumps(data, indent=4)}\n\n === PARSER NOT FOUND ==="
            )
            return ["[ERR - Parser Not Found]"]
        if parser == None:
            logging.warning(
                f"Failed to parse entry\n\t{json.dumps(data, indent=4)}\n === PARSER NOT IMPLEMENTED ==="
            )
            return ["[ERR - Parser Not Implemented]"]
        if parser == "RAW":
            if type(data) == str:
                return parse_5etools_string(data)
            elif type(data) == list:
                return self.parse(data)
            return data

        return parser(data)

    def parse(self, data: list[dict]) -> list[str]:
        out = []
        for e in data:
            if type(e) == str:
                out.append(parse_5etools_string(e))
            elif type(e) == dict:
                try:
                    out.extend(self._parse_one(e))
                except:
                    logging.exception(
                        f"Failed to parse entry\n\n{json.dumps(data, indent=4)}\n\n === EXCEPTION ===\n"
                    )
                    out.append("[ERR - Unexpected Exception]")
            else:
                out.append(e)

        for l in out:
            l = parse_5etools_string(l)

        return out
