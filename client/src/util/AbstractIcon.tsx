import * as MaterialIcons from "react-icons/md";
import * as GameIcons from "react-icons/gi";
import { IconType } from "react-icons";

export type AbstractIconType = "material" | "game";

export default function AbstractIcon(props: {
    type: AbstractIconType;
    name: string;
    default?: IconType;
    className?: string;
}) {
    let IconComponent: IconType;

    switch (props.type) {
        case "material":
            IconComponent = (MaterialIcons as any)[props.name] as IconType;
            break;
        case "game":
            IconComponent = (GameIcons as any)[props.name] as IconType;
            break;
    }

    if (!IconComponent) {
        if (props.default) {
            IconComponent = props.default;
        } else {
            IconComponent = MaterialIcons.MdInfo;
        }
    }

    return <IconComponent className={props.className} />;
}
