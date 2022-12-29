export type SharePermission = "view" | "edit" | "share" | "delete" | "admin";

interface BaseContentType {
    oid: string;
    type: string;
    owner: string;
    shared: { [key: string]: SharePermission[] };
    parent: string | "root";
    name: string;
    image: string | null;
    tags: string[];
}

interface FolderContentType extends BaseContentType {
    type: "folder";
    children: { [key: string]: string };
}

export type ContentType = FolderContentType;
