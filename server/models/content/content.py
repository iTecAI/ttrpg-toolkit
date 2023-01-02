from util.orm import ORM
from util.user_content import GenericContentManager
from models.accounts import Session
from ..accounts import User
from pymongo.database import Database
from pymongo.collection import Collection
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
share: User can share Content and its children with other users, and grant some permissions
    This permission cannot grant `admin` permissions, and can only otherwise grant permissions it has
delete: User can delete Content and its children.
admin: User can perform any action on Content and its children
    This permission implies all other permissions
    This permission can only be granted by the owner
"""


class ContentType(ORM):
    object_type = "content"
    collection = "content"

    type_map = {"folder": None}

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
        data: Union[str, None] = None,
        dataType: Union[str, None] = None,
        **kwargs,
    ):
        super().__init__(oid, database, **kwargs)
        self.owner = owner
        self.shared = shared
        self.parent = parent
        self.name = name
        self.image = image
        self.tags = tags
        self.data = data
        self.dataType = dataType

    @classmethod
    def create(
        cls,
        database: Database,
        user: User,
        parent: Union[str, Literal["root"]],
        name: str,
        image: Union[str, None] = None,
        tags: list[str] = [],
        data: Union[str, None] = None,
        dataType: str = "folder",
    ):
        return cls(
            database=database,
            owner=user.oid,
            parent=parent,
            name=name,
            image=image,
            tags=tags,
            data=data,
            dataType=dataType,
        )

    @classmethod
    def get_with_permission(
        cls: "ContentType",
        database: Database,
        parent: Union[str, Literal["root"]],
        user: User,
        permission: PERMISSION_TYPE_KEY,
    ) -> list[str]:
        """Gets all child IDs

        :param cls: Implicitly provided class
        :type cls: ContentType
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
        parent: ContentType = ContentType.load_oid(self.parent, self.database)
        if parent == None:
            return False
        return parent.get_permission(permission, oid)

    def permissions_of(self, user: Union[User, str]) -> PERMISSION_TYPE:
        return {i: self.check_permission(i, user) for i in PERMISSION_TYPE_KEYS}

    @property
    def resolved_permissions(self) -> dict[str, PERMISSION_TYPE]:
        results = {self.owner: self.resolve_permission_map({"admin": True})}
        for s in self.shared.keys():
            results[s] = {
                k: v if self.parent != "root" else (False if v == None else v)
                for k, v in self.resolve_permission_map(self.shared[s]).items()
            }

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

    def delete(self, content: GenericContentManager, dry_run=False) -> list[str]:
        results = [self.oid]
        if self.dataType == "folder":
            children: list[ContentType] = ContentType.load_multiple_from_query(
                {"parent": self.oid}, self.database
            )
            results.extend([c.delete(dry_run=dry_run) for c in children])
        else:
            raise NotImplementedError("TODO: Other data types")

        if not dry_run and self.image:
            content.delete(self.image)

        if not dry_run:
            self.database[self.collection].delete_one({"oid": self.oid})

        return list(set(results))
