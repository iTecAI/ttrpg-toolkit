import { Avatar } from "@mui/material";
import { Icon } from "../../../libs/modoc/renderers/common";
import { AvatarType } from "../../../libs/modoc/types";
import { parseValueItem } from "../../../libs/modoc/util";
import { DataItem } from "../../../models/compendium";

export function AvatarItem(props: {
    data: DataItem;
    spec?: AvatarType;
}): JSX.Element {
    if (props.spec) {
        switch (props.spec.type) {
            case "icon":
                return (
                    <Avatar>
                        <Icon icon={props.spec.icon} />
                    </Avatar>
                );
            case "image":
                return (
                    <Avatar
                        src={parseValueItem(props.spec.source, props.data)}
                        alt={parseValueItem(props.spec.alt, props.data)}
                    />
                );
            case "text":
                return (
                    <Avatar>
                        {parseValueItem(props.spec.text, props.data)}
                    </Avatar>
                );
        }
    }
    return <></>;
}
