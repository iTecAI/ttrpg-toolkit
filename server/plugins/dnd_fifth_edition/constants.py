ABILITIES = [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
]

ABILITY_MAP = {
    "str": "strength",
    "dex": "dexterity",
    "con": "constitution",
    "int": "intelligence",
    "wis": "wisdom",
    "cha": "charisma",
}

SPELLSLOT_MAP = {
    "artificer": [
        [2, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [3, 0, 0, 0, 0],
        [3, 0, 0, 0, 0],
        [4, 2, 0, 0, 0],
        [4, 2, 0, 0, 0],
        [4, 3, 0, 0, 0],
        [4, 3, 0, 0, 0],
        [4, 3, 2, 0, 0],
        [4, 3, 2, 0, 0],
        [4, 3, 3, 0, 0],
        [4, 3, 3, 0, 0],
        [4, 3, 3, 1, 0],
        [4, 3, 3, 1, 0],
        [4, 3, 3, 2, 0],
        [4, 3, 3, 2, 0],
        [4, 3, 3, 3, 1],
        [4, 3, 3, 3, 1],
        [4, 3, 3, 3, 2],
        [4, 3, 3, 3, 2],
    ],
    "pact": [
        [1, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [0, 2, 0, 0, 0],
        [0, 2, 0, 0, 0],
        [0, 0, 2, 0, 0],
        [0, 0, 2, 0, 0],
        [0, 0, 0, 2, 0],
        [0, 0, 0, 2, 0],
        [0, 0, 0, 0, 2],
        [0, 0, 0, 0, 2],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 3],
        [0, 0, 0, 0, 4],
        [0, 0, 0, 0, 4],
        [0, 0, 0, 0, 4],
        [0, 0, 0, 0, 4],
    ],
    "1/3": [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [2, 0, 0, 0],
        [3, 0, 0, 0],
        [3, 0, 0, 0],
        [3, 0, 0, 0],
        [4, 2, 0, 0],
        [4, 2, 0, 0],
        [4, 2, 0, 0],
        [4, 3, 0, 0],
        [4, 3, 0, 0],
        [4, 3, 0, 0],
        [4, 3, 2, 0],
        [4, 3, 2, 0],
        [4, 3, 2, 0],
        [4, 3, 3, 0],
        [4, 3, 3, 0],
        [4, 3, 3, 0],
        [4, 3, 3, 1],
        [4, 3, 3, 1],
    ],
    "1/2": [
        [0, 0, 0, 0, 0],
        [2, 0, 0, 0, 0],
        [3, 0, 0, 0, 0],
        [3, 0, 0, 0, 0],
        [4, 2, 0, 0, 0],
        [4, 2, 0, 0, 0],
        [4, 3, 0, 0, 0],
        [4, 3, 0, 0, 0],
        [4, 3, 2, 0, 0],
        [4, 3, 2, 0, 0],
        [4, 3, 3, 0, 0],
        [4, 3, 3, 0, 0],
        [4, 3, 3, 1, 0],
        [4, 3, 3, 1, 0],
        [4, 3, 3, 2, 0],
        [4, 3, 3, 2, 0],
        [4, 3, 3, 3, 1],
        [4, 3, 3, 3, 1],
        [4, 3, 3, 3, 2],
        [4, 3, 3, 3, 2],
    ],
    "full": [
        [2, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 0, 0, 0, 0, 0, 0, 0, 0],
        [4, 2, 0, 0, 0, 0, 0, 0, 0],
        [4, 3, 0, 0, 0, 0, 0, 0, 0],
        [4, 3, 2, 0, 0, 0, 0, 0, 0],
        [4, 3, 3, 0, 0, 0, 0, 0, 0],
        [4, 3, 3, 1, 0, 0, 0, 0, 0],
        [4, 3, 3, 2, 0, 0, 0, 0, 0],
        [4, 3, 3, 3, 1, 0, 0, 0, 0],
        [4, 3, 3, 3, 2, 0, 0, 0, 0],
        [4, 3, 3, 3, 2, 1, 0, 0, 0],
        [4, 3, 3, 3, 2, 1, 0, 0, 0],
        [4, 3, 3, 3, 2, 1, 1, 0, 0],
        [4, 3, 3, 3, 2, 1, 1, 0, 0],
        [4, 3, 3, 3, 2, 1, 1, 1, 0],
        [4, 3, 3, 3, 2, 1, 1, 1, 0],
        [4, 3, 3, 3, 2, 1, 1, 1, 1],
        [4, 3, 3, 3, 3, 1, 1, 1, 1],
        [4, 3, 3, 3, 3, 2, 1, 1, 1],
        [4, 3, 3, 3, 3, 2, 2, 1, 1],
    ],
}
