import {
    ValueItem,
    AllRenderItems,
    AllSourceItems,
    AvatarType,
} from "../libs/modoc/types";

export type CompendiumItem = {
    supertype: "compendium-item";
    type: string;
    plugin: string;
    slug: ValueItem;
    displayName: ValueItem;
    source: ValueItem;
    avatar?: AvatarType;
    media?: {
        source: ValueItem;
        alt: ValueItem;
    };
    briefContents: AllRenderItems[] | AllSourceItems;
    fullContents: AllRenderItems;
};

export type DataItem = {
    name: string;
    oid: string;
    [key: string]: any;
};
