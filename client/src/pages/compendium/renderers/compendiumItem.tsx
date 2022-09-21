import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    CardMedia,
} from "@mui/material";
import { MuiRenderParser, ModularRenderer } from "../../../libs/modoc";
import { Icon } from "../../../libs/modoc/renderers/common";
import { parseValueItem } from "../../../libs/modoc/util";
import { CompendiumItem, DataItem } from "../../../models/compendium";

export function CompendiumItemRenderer(props: {
    renderer: CompendiumItem;
    data: DataItem;
}): JSX.Element {
    let avatar: JSX.Element | undefined = undefined;
    if (props.renderer.avatar) {
        switch (props.renderer.avatar.type) {
            case "icon":
                avatar = (
                    <Avatar>
                        <Icon icon={props.renderer.avatar.icon} />
                    </Avatar>
                );
                break;
            case "image":
                avatar = (
                    <Avatar
                        src={parseValueItem(
                            props.renderer.avatar.source,
                            props.data
                        )}
                        alt={parseValueItem(
                            props.renderer.avatar.alt,
                            props.data
                        )}
                    />
                );
                break;
            case "text":
                avatar = (
                    <Avatar>
                        {parseValueItem(props.renderer.avatar.text, props.data)}
                    </Avatar>
                );
                break;
        }
    }

    return (
        <Card
            className="compendium-item"
            id={parseValueItem(props.renderer.slug, props.data)}
        >
            <CardHeader
                avatar={avatar}
                title={parseValueItem(props.renderer.displayName, props.data)}
                subheader={parseValueItem(props.renderer.source, props.data)}
            />
            {props.renderer.media && (
                <CardMedia
                    component="img"
                    image={parseValueItem(
                        props.renderer.media.source,
                        props.data
                    )}
                    alt={parseValueItem(props.renderer.media.alt, props.data)}
                />
            )}
            <CardContent>
                <ModularRenderer
                    data={props.data}
                    renderer={{
                        supertype: "render",
                        type: "group",
                        children: props.renderer.briefContents,
                    }}
                    parser={MuiRenderParser}
                />
            </CardContent>
        </Card>
    );
}
