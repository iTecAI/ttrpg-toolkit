from util import ORM
from models.accounts import Session
from ..accounts import User
from pymongo.database import Database
from typing import Literal, Union, TypedDict

PERMISSION_VALUE = Union[bool, None]
PERMISSION_TYPE_KEY = Literal["view", "edit", "share", "delete", "admin"]
PERMISSION_TYPE_KEYS = ["view", "edit", "share", "delete", "admin"]


class PERMISSION_TYPE(TypedDict):
    view: PERMISSION_VALUE
    edit: PERMISSION_VALUE
    share: PERMISSION_VALUE
    delete: PERMISSION_VALUE
    admin: PERMISSION_VALUE


"""
Permissions for sharing content.
Permissions propagate to all children, unless those children have non-null PERMISSION_VALUES that conflict

view: User can see Content and its children.
edit: User can edit Content and its children.
    This permission implies `read`
share: User can share Content and its children with other users, and grant some permissions
    This permission implies `read`
    This permission cannot grant `share` and `admin` permissions, and can only otherwise grant permissions it has
delete: User can delete Content and its children.
    This permission implies `read`
admin: User can perform any action on Content and its children
    This permission implies all other permissions
    This permission can grant users the `share` permission
    This permission can only be granted by the owner
"""


class BaseContentType(ORM):
    object_type = "content"
    collection = "content"
    include = ["subtype"]
    subtype: str = None

    def __init__(
        self,
        oid: str = None,
        database: Database = None,
        owner: str = None,
        shared: dict[str, PERMISSION_TYPE] = {},
        parent: Union[str, Literal["root"]] = None,
        name: str = None,
        image: Union[str, None] = None,
        tags: list[str] = [],
        **kwargs,
    ):
        """BaseContentType initializer

        :param oid: Object UUID, defaults to None
        :type oid: str, optional
        :param database: PyMongo DB, defaults to None
        :type database: Database, optional
        :param owner: Owner UUID, defaults to None
        :type owner: str, optional
        :param shared: Mapping of {User/Game UUID : PERMISSION_TYPE}, defaults to {}
        :type shared: dict[str, PERMISSION_TYPE], optional
        :param parent: Parent Content UUID or "root", defaults to None
        :type parent: Union[str, Literal["root"]], optional
        :param name: Content name, defaults to None
        :type name: str, optional
        :param image: Link to Content image, defaults to None
        :type image: Union[str, None], optional
        :param tags: Array of Content tags, defaults to []
        :type tags: list[str], optional
        """
        super().__init__(oid, database, **kwargs)
        self.owner = owner
        self.shared = shared
        self.parent = parent
        self.name = name
        self.image = image
        self.tags = tags

    @classmethod
    def create(
        cls,
        database: Database,
        user: User,
        parent: Union[str, Literal["root"]],
        name: str,
        image: Union[str, None] = None,
        tags: list[str] = [],
    ):
        """BaseContentType creator function

        :param database: PyMongo DB, defaults to None
        :type database: Database
        :param user: User object
        :type user: User
        :param parent: Parent Content UUID or "root"
        :type parent: Union[str, Literal["root"]]
        :param name: Content name
        :type name: str
        :param image: Link to Content image, defaults to None
        :type image: Union[str, None], optional
        :param tags: Array of Content tags, defaults to []
        :type tags: list[str], optional
        """
        return cls(
            database=database,
            owner=user.oid,
            parent=parent,
            name=name,
            image=image,
            tags=tags,
        )

    @classmethod
    def get_with_permission(
        cls: "BaseContentType",
        database: Database,
        parent: Union[str, Literal["root"]],
        user: User,
        permission: PERMISSION_TYPE_KEY,
    ) -> list[str]:
        """Gets all child IDs

        :param cls: Implicitly provided class
        :type cls: BaseContentType
        :param database: PyMongo Database
        :type database: Database
        :param parent: ID of parent to check within
        :type parent: Union[str, Literal["root"]]
        :param user: User object to check
        :type user: User
        :param permission: Permission to check
        :type permission: PERMISSION_TYPE_KEY
        :return: Array of all object IDs found
        :rtype: list[str]
        """
        all_results = cls.load_multiple_from_query(
            {"parent": parent},
            database,
        )

        results = [r.oid for r in all_results if r.check_permission(permission, user)]
        return results

    @staticmethod
    def resolve_permission_map(mapping: PERMISSION_TYPE) -> PERMISSION_TYPE:
        if mapping["admin"] == True:
            return {
                "view": True,
                "edit": True,
                "share": True,
                "delete": True,
                "admin": True,
            }
        if any([i for i in mapping.values()]):
            return {
                "view": True,
                "edit": mapping["edit"],
                "share": mapping["share"],
                "delete": mapping["delete"],
                "admin": mapping["admin"],
            }
        return mapping

    def check_permission(
        self, permission: PERMISSION_TYPE_KEY, user: Union[User, str]
    ) -> bool:
        """Checks if a user has a specified permission on this ContentType

        :param permission: Permission to check
        :type permission: PERMISSION_TYPE_KEY
        :param user: User object to check
        :type user: User
        :return: True or False
        :rtype: bool
        """
        if type(user) == str:
            oid = user
        else:
            oid = user.oid
        if self.owner == oid:
            return True
        if oid in self.shared.keys():
            resolved = self.resolve_permission_map(self.shared[oid])
            if resolved[permission] != None:
                return resolved[permission]
        if self.parent == "root":
            return False
        parent: BaseContentType = BaseContentType.load_oid(self.parent, self.database)
        if parent == None:
            return False
        return parent.get_permission(permission, oid)

    @property
    def minimize(self):
        raise NotImplementedError("Cannot minimize BaseContentType")

    @property
    def resolved_permissions(self) -> dict[str, PERMISSION_TYPE]:
        results = {self.owner: self.resolve_permission_map({"admin": True})}
        for s in self.shared.keys():
            results[s] = self.resolve_permission_map(self.shared[s])

        if self.parent != "root":
            parent = self.load_oid(self.parent, self.database)
            parent_rp = parent.resolved_permissions
            for k, v in parent_rp.items():
                if k in results.keys():
                    results[k] = v
                else:
                    for i, j in v.items():
                        if j == None:
                            results[k][i] = j

        return results

    def users_with(self, permission: PERMISSION_TYPE_KEY) -> list[str]:
        res = [k for k, v in self.resolved_permissions.items() if v[permission] == True]
        res.append(self.owner)
        return res

    def sessions_with(self, permission: PERMISSION_TYPE_KEY) -> list[str]:
        users_with_perm = self.users_with(permission)
        sessions = [
            i.oid
            for i in Session.load_multiple_from_query(
                {"uid": {"$in": users_with_perm}}, self.database
            )
        ]
        return sessions
