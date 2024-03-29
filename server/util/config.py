import dotenv
import os
import json5 as json

dotenv.load_dotenv()


class Config:
    def __init__(self, file=None):
        if file:
            self.cpath = file
        elif os.environ.get("CONFIG_PATH"):
            self.cpath = os.environ.get("CONFIG_PATH")
        else:
            self.cpath = "config/root_config.json"

        with open(self.cpath, "r") as f:
            self.raw = json.load(f)

        self.data = self._parse_dict(self.raw)

    def __getitem__(self, key: str):
        return self.data[key]

    def _parse_dict(self, data: dict):
        output = {}
        for k, v in data.items():
            if type(v) == dict:
                output[k] = self._parse_dict(v)
            elif type(v) == list:
                output[k] = self._parse_list(v)
            elif type(v) == str and v.startswith("$"):
                output[k] = self._parse_command(v)
            else:
                output[k] = v

        return output

    def _parse_list(self, data: list):
        output = []
        for i in data:
            if type(i) == dict:
                output.append(self._parse_dict(i))
            elif type(i) == list:
                output.append(self._parse_list(i))
            elif type(i) == str and i.startswith("$"):
                output.append(self._parse_command(i))
            else:
                output.append(i)

        return output

    def _parse_command(self, data: str):
        parts = data.lstrip("$").split(":")
        command = parts[0]
        args = parts[1:]

        if command in ["workdir", "cwd", "working_directory"]:
            if len(args) == 0:
                return os.getcwd()
            else:
                return os.getcwd().rstrip("/\\") + os.sep + args[0].lstrip("/\\")

        if command == "env":
            return os.environ.get(args[0])

        if command == "sub":
            sub_conf = Config(file=os.path.join(os.path.split(self.cpath)[0], args[0]))
            return sub_conf.data

        if command == "file":
            with open(
                os.path.join(
                    os.path.split(self.cpath)[0], os.path.join(*args[0].split("/"))
                ),
                "r",
            ) as f:
                if len(args) == 1:
                    return f.read()
                elif args[1] == "lines":
                    return f.read().splitlines()
                else:
                    return f.read()

        return data
