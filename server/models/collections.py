from util.orm import ORM
from .games import Game
from .accounts import Session
from pymongo.database import Database
from typing import Literal, List, TypedDict
from .accounts import User

"""
Defines a Literal type for sharing permissions for Collections
`read`: User can view items within this collection
`edit`: User can edit existing items within this collection
    This permission also implies `read` permissions for the whole collection
`create`: User can create items within this collection.
    This permission also implies `read` permissions for the whole collection
    This permission also implies `edit` and `delete` permissions for created items
`delete`: User can delete items within this collection
    This permission also implies `read` permissions for the whole collection
`share`: User can share the collection with other users, granting any permissions that they themselves have
    This permission also implies `read` permissions for the whole collection
`configure`: User can modify collection settings
    This permission also implies `read` permissions for the whole collection
    This permission has the following limitation: it cannot grant other users `admin` and `promoter` permissions
`admin`: User can perform any action to the collection
    This permission also implies all above permissions for the whole collection
    This permission has the following limitation: it cannot grant other users `admin` and `promoter` permissions
`promoter`: User can promote users to admin permissions
    This permission also implies `read` and `share` permissions for the whole collection
    This permission has the following limitation: it cannot grant other users `promoter` permissions
    This permission has the following limitation: it can only be granted by the collection owner
`owner`: Permission indicating that the user owns the Object. Meant for internal use
    This permission also implies all other permissions
    This permission has the following limitation: It can only be retained by one user and cannot be granted to Games
"""
COLLECTION_SHARE_TYPE = List[
    Literal[
        "read",
        "edit",
        "create",
        "delete",
        "share",
        "configure",
        "admin",
        "promoter",
        "owner",
    ]
]

COLLECTION_ITEM_TYPE = Literal["subcollection"]


class ItemLocator(TypedDict):
    oid: str
    subtype: COLLECTION_ITEM_TYPE


class CollectionObject(ORM):
    object_type: str = "collection_object"
    collection: str = "collection_objects"
    subtype: str = None

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        parents: list[str] = [],
        owner_id: str = None,
        **kwargs,
    ):
        """A generic Collection Object. Should not be directly instantiated.

        :param oid: Object ID, defaults to None
        :type oid: str, optional
        :param database: MongoDB Database to save to, defaults to None
        :type database: Database, optional
        :param parents: List of parent collections
        :type parents: list[str]
        :param owner_id: User ID of owner, defaults to None
            This may be different from the Collection owner, if another user has the `create` permission
        :type owner_id: str, optional
        """
        super().__init__(oid, database, **kwargs)
        self.parents = parents
        self.owner_id = owner_id


class Collection(ORM):
    object_type: str = "collection"
    collection: str = "collections"

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        owner_id: str = None,
        parents: list[str] = [],
        shared_users: dict[str, COLLECTION_SHARE_TYPE] = {},
        shared_games: dict[str, COLLECTION_SHARE_TYPE] = {},
        name: str = None,
        description: str = None,
        tags: List[str] = [],
        image: str = None,
        children: dict[str, COLLECTION_ITEM_TYPE] = {},
        **kwargs,
    ):
        """Initialize a Collection of CollectionObjects

        :param oid: Collection ID, defaults to None
        :type oid: str, optional
        :param database: MongoDB Database to save to, defaults to None
        :type database: Database, optional
        :param owner_id: Owner User ID, defaults to None
        :type owner_id: str, optional
        :param parents: Array of parent collection IDs or "root" to specify that this is a top-level collection
        :type parents: list[str], optional
        :param shared_users: Dictionary of {User ID: COLLECTION_SHARE_TYPE} defining what Users to share with, defaults to {}
            Permissions granted here take precedence over any permissions granted to an entire Game
        :type shared_users: dict[str, COLLECTION_SHARE_TYPE], optional
        :param shared_games: Dictionary of {Game ID: COLLECTION_SHARE_TYPE} defining what Games to share with, defaults to {}
            All Users within the shared Game will have the same permissions, unless they are overridden by user share permissions.
        :type shared_games: dict[str, COLLECTION_SHARE_TYPE], optional
        :param name: Collection name, defaults to None
        :type name: str, optional
        :param description: Collection description, defaults to None
        :type description: str, optional
        :param tags: List of Collection tags, defaults to []
        :type tags: List[str], optional
        :param image: Link to Collection image, defaults to None
        :type image: str, optional
        :param children: Dict of {child ID : child type}
        :type children: dict[str, COLLECTION_ITEM_TYPE], optional
        """
        super().__init__(oid, database, **kwargs)
        self.owner_id = owner_id
        self.parents = parents
        self.shared_users = shared_users
        self.shared_games = shared_games
        self.name = name
        self.description = description
        self.tags = tags
        self.image = image
        self.children = children

    @classmethod
    def create(
        cls,
        database: Database,
        owner: User,
        parent: str = None,
        name: str = None,
        description: str = None,
        tags: list[str] = [],
        image: str = None,
    ) -> "Collection":
        """Create a collection object from basic instance data

        :param database: PyMongo Database object
        :type database: Database
        :param owner: User object
        :type owner: User
        :param parent: Parent collection ID or None to signify a top-level collection
        :type parent: str, optional
        :param name: Name string, defaults to None
        :type name: str, optional
        :param description: Description string, defaults to None
        :type description: str, optional
        :param tags: List of string tags, defaults to []
        :type tags: list[str], optional
        :param image: Image URI, defaults to None
        :type image: str, optional
        :return: Instantiated Collection with new OID
        :rtype: Collection
        """
        return Collection(
            database=database,
            owner_id=owner.oid,
            parents=[parent] if parent else ["root"],
            name=name,
            description=description,
            tags=tags,
            image=image,
        )

    def check_permissions(self, user: User) -> COLLECTION_SHARE_TYPE:
        """Gets the permissions array of a user for this Collection

        :param user: User object
        :type user: User
        :return: Array of permission strings
        :rtype: COLLECTION_SHARE_TYPE
        """
        if user.oid == self.owner_id:
            return ["owner"]
        if user.oid in self.shared_users.keys():
            return self.shared_users[user.oid]
        game_perms = []
        for g in user.games:
            if g in self.shared_games.keys():
                game_perms.extend(self.shared_games[g])
        return list(set(game_perms))

    @property
    def users(self) -> list[str]:
        results = []
        results.append(self.owner_id)
        results.extend(
            [
                u.oid
                for u in User.load_multiple_from_query(
                    {"oid": {"$in": list(self.shared_users.keys())}}, self.database
                )
            ]
        )
        game_users = []
        [
            game_users.extend([u.owner_id, *u.participants])
            for u in Game.load_multiple_from_query(
                {"oid": {"$in": list(self.shared_games.keys())}}, self.database
            )
        ]
        results.extend(game_users)
        return list(set(results))

    @property
    def sessions(self) -> list[str]:
        users = self.users
        sessions: list[Session] = Session.load_multiple_from_query(
            {"uid": {"$in": users}}, self.database
        )
        return [s.oid for s in sessions]

    @staticmethod
    def expand_share_array(shares: COLLECTION_SHARE_TYPE) -> COLLECTION_SHARE_TYPE:
        """Expands share array to include all implied permissions

        :param shares: Non-expanded array
        :type shares: COLLECTION_SHARE_TYPE
        :return: Expanded array
        :rtype: COLLECTION_SHARE_TYPE
        """
        output = []
        expand_mapping = {
            "read": [],
            "edit": ["read"],
            "create": ["read"],
            "delete": ["read"],
            "share": ["read"],
            "configure": ["read"],
            "admin": ["read", "edit", "create", "delete", "share", "configure"],
            "promoter": ["read", "share"],
            "owner": [
                "read",
                "edit",
                "create",
                "delete",
                "share",
                "configure",
                "admin",
                "promoter",
            ],
        }

        for s in shares:
            if s in expand_mapping.keys():
                output.append(s)
                output.extend(expand_mapping[s])

        return list(set(output))

    @classmethod
    def get_accessible(
        cls, database: Database, user: User, parent: str
    ) -> list["Collection"]:
        """Returns an array of all Collections the user has read permissions for

        :param database: MongoDB Database object
        :type database: Database
        :param user: User object to check
        :type user: User
        :param parent: ID of parent to search within, or "root"
        :type parent: str

        :return: List of Collection objects
        :rtype: Collection[]
        """
        user_games = user.games

        # Complex queries to get all viewable collections/objects
        QUERY_COLLECTIONS = {
            "$or": [
                {
                    f"shared_users.${user.oid}": {
                        "$exists": True,
                        "$in": [
                            "read",
                            "edit",
                            "create",
                            "delete",
                            "share",
                            "configure",
                            "admin",
                            "promoter",
                        ],
                    },
                },
                {"owner_id": user.oid},
                {
                    "$or": [
                        {
                            f"shared_games.{g}": {
                                "$exists": True,
                                "$in": [
                                    "read",
                                    "edit",
                                    "create",
                                    "delete",
                                    "share",
                                    "configure",
                                    "admin",
                                    "promoter",
                                ],
                            }
                        }
                        for g in user_games
                    ]
                },
            ]
            if len(user_games) > 0
            else [
                {
                    f"shared_users.{user.oid}": {
                        "$exists": True,
                        "$in": [
                            "read",
                            "edit",
                            "create",
                            "delete",
                            "share",
                            "configure",
                            "admin",
                            "promoter",
                        ],
                    },
                },
                {"owner_id": user.oid},
            ],
            "parents": parent,
        }

        result: dict[str, "Collection"] = {}
        for coll in cls.load_multiple_from_query(QUERY_COLLECTIONS, database):
            result[coll.oid] = coll

        return list(result.values())

    def get_accessible_children(self, user: User) -> dict[str, COLLECTION_ITEM_TYPE]:
        """Gets an array of all accessible children in a Collection

        :param user: User object
        :type user: User
        :return: Array of CollectionObjects
        :rtype: list[CollectionObject]
        """
        if not "read" in self.expand_share_array(self.check_permissions(user)):
            return {}

        results = {}
        for oid in self.children.keys():
            if self.children[oid] == "subcollection":
                coll: Collection = Collection.load_oid(oid, self.database)
                if coll and "read" in coll.expand_share_array(
                    coll.check_permissions(user)
                ):
                    results[oid] = self.children[oid]
            else:
                results[oid] = self.children[oid]

        return results

    def delete(self, dry=False) -> list[ItemLocator]:
        result = []
        result.append({"oid": self.oid, "subtype": "subcollection"})
        for c in self.children.keys():
            if self.children[c] == "subcollection":
                item: Collection = Collection.load_oid(c, self.database)
                if item:
                    result.extend(item.remove_parent(self.oid, dry=dry))
        if not dry:
            self.database[self.collection].delete_one({"oid": self.oid})
        return result

    def remove_parent(self, parent: str, dry=False) -> list[ItemLocator]:
        result = []
        new_parents = self.parents[:]
        if dry:
            if parent in new_parents:
                new_parents.remove(parent)
            if len(new_parents) == 0:
                result.extend(self.delete(dry=dry))

            return result
        else:
            if parent in self.parents:
                self.parents.remove(parent)
            if len(self.parents) == 0:
                result.extend(self.delete(dry=dry))
            else:
                self.save()

            return result
