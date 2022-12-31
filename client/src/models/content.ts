export type SharePermissionValue = boolean | null;

export type SharePermission = {
    view: SharePermissionValue;
    edit: SharePermissionValue;
    share: SharePermissionValue;
    delete: SharePermissionValue;
    admin: SharePermissionValue;
    owner: SharePermissionValue;
};

interface BaseContentType {
    oid: string;
    owner: string;
    shared: { [key: string]: SharePermission };
    parent: string | "root";
    name: string;
    image: string | null;
    tags: string[];
    dataType: string;
}

interface FolderContentType extends BaseContentType {
    contentType: "folder";
    children: { [key: string]: string };
}

export type ContentType = FolderContentType;
export type MinimalContentType = FolderContentType;
