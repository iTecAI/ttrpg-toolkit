import * as MdReactIcons from "react-icons/md";
import * as GiReactIcons from "react-icons/gi";
import { IconBaseProps } from "react-icons";

import { AvatarType, FormData, ValueItem } from "../types";
import { parseValueItem } from "../utility/parsers";
import { Avatar } from "@mui/material";
import { useContext } from "react";
import { DocumentContext } from "../utility/document_communication";

export const iconMap = { md: MdReactIcons, gi: GiReactIcons };
export type IconFamily = "md" | "gi";
type IconExpanded = {
    family: IconFamily;
    name: string | ValueItem;
};

export type IconType = IconExpanded | ValueItem;

function isExpandedIcon(object: any): object is IconExpanded {
    return (
        object.family &&
        object.name &&
        Object.keys(iconMap).includes(object.family)
    );
}

export function Icon(props: {
    icon: IconType;
    iconProps?: IconBaseProps;
    data?: any;
    formData?: FormData;
}): JSX.Element {
    let iconDescriptor: IconExpanded;
    if (!isExpandedIcon(props.icon)) {
        let icon: string | IconExpanded = parseValueItem(
            props.icon,
            props.data ?? {},
            props.formData ?? {}
        ).result;
        if (!isExpandedIcon(icon)) {
            if (icon.includes(".")) {
                iconDescriptor = {
                    family: icon.split(".")[0] as IconFamily,
                    name: icon.split(".")[1],
                };
            } else {
                throw new Error(
                    `Parsed icon descriptor ${icon} is not a valid icon URI`
                );
            }
        } else {
            iconDescriptor = icon;
        }
    } else {
        iconDescriptor = props.icon;
    }

    iconDescriptor.name = parseValueItem(
        iconDescriptor.name,
        props.data ?? {},
        props.formData ?? {}
    ).result;

    if (!Object.keys(iconMap).includes(iconDescriptor.family)) {
        throw new Error(
            `Icon family "${
                iconDescriptor.family
            }" does not exist, valid families are [${Object.keys(iconMap).join(
                ", "
            )}]`
        );
    }
    if (
        !Object.keys(iconMap[iconDescriptor.family]).includes(
            iconDescriptor.name as string
        )
    ) {
        throw new Error(
            `Icon name "${iconDescriptor.name}" does not exist in family "${
                iconDescriptor.family
            }", valid icon names are [${Object.keys(
                iconMap[iconDescriptor.family]
            ).join(", ")}]`
        );
    }

    const IconElement: (props: IconBaseProps) => JSX.Element = (
        iconMap[iconDescriptor.family] as any
    )[iconDescriptor.name as string];

    return <IconElement {...props.iconProps} />;
}

/**
 * Renders an avatar from a generic AvatarType
 * @param props {item: AvatarType Object, data?: Data override}
 * @return <Avatar>
 */
export function ModularAvatar(props: {
    item: AvatarType;
    data?: any;
}): JSX.Element {
    const { item, data } = props;
    const context = useContext(DocumentContext);
    const formData = context ? context.values : {};
    switch (item.type) {
        case "icon":
            return (
                <Avatar sx={{ width: 24, height: 24 }}>
                    <Icon icon={item.icon} />
                </Avatar>
            );
        case "image":
            return (
                <Avatar
                    src={parseValueItem(item.source, data, formData).result}
                    alt={parseValueItem(item.alt, data, formData).result}
                    sx={{ width: 24, height: 24 }}
                />
            );
        case "text":
            return (
                <Avatar sx={{ width: 24, height: 24 }}>
                    {parseValueItem(item.text, data, formData).result}
                </Avatar>
            );
    }
}
