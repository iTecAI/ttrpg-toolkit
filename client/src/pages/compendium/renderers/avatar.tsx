import { Avatar } from "@mui/material";
import { Icon } from "../../../libs/modular-renderer/renderers/common";
import { AvatarType } from "../../../libs/modular-renderer/types";
import { parseValueItem } from "../../../libs/modular-renderer/utility/parsers";
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
                        src={
                            parseValueItem(props.spec.source, props.data, {})
                                .result
                        }
                        alt={
                            parseValueItem(props.spec.alt, props.data, {})
                                .result
                        }
                    />
                );
            case "text":
                return (
                    <Avatar>
                        {parseValueItem(props.spec.text, props.data, {}).result}
                    </Avatar>
                );
        }
    }
    return <></>;
}
