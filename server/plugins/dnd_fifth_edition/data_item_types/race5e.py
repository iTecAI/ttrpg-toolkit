from util.plugin_utils import AbstractDataSourceItem


class Race5e(AbstractDataSourceItem):
    subtype: str = "race_5e"
    plugin: str = "dnd_fifth_edition"

    def __init__(self, name: str = None, **kwargs):
        super().__init__(name, **kwargs)
