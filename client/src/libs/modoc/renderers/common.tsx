import * as MdReactIcons from "react-icons/md";
import * as GiReactIcons from "react-icons/gi";
import { IconBaseProps } from "react-icons";

import { ValueItem } from "../types";
import { parseValueItem } from "../util";

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
}): JSX.Element {
    let iconDescriptor: IconExpanded;
    if (!isExpandedIcon(props.icon)) {
        let icon: string | IconExpanded = parseValueItem(
            props.icon,
            props.data ?? {},
            {}
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
        {}
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
