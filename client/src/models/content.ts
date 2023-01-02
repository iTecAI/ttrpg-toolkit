export type SharePermissionValue = boolean | null;

export type SharePermission = {
    view: SharePermissionValue;
    edit: SharePermissionValue;
    share: SharePermissionValue;
    delete: SharePermissionValue;
    admin: SharePermissionValue;
    owner: SharePermissionValue;
};

export type MinimalContentType = {
    oid: string;
    owner: string;
    shared: SharePermission;
    parent: string | "root";
    name: string;
    image: string | null;
    tags: string[];
    dataType: string;
};

export type ShareType = {
    uid: string;
    owner: boolean;
    explicit: SharePermission;
    implicit: SharePermission;
};
