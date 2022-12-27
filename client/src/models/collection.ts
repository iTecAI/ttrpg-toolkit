export type CollectionShare =
    | "read"
    | "edit"
    | "create"
    | "delete"
    | "share"
    | "configure"
    | "admin"
    | "promoter"
    | "owner";

export type MinimalCollection = {
    collectionId: string;
    ownerId: string;
    permissions: CollectionShare[];
    name: string;
    description: string | null;
    image: string | null;
    tags: string[];
    children: string[];
};

export type ShareCollectionItem = {
    shareType: "user" | "game";
    oid: string;
    permissions: CollectionShare[];
    name: string;
    imageSrc: string;
};
