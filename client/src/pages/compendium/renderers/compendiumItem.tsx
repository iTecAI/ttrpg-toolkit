import {
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    CardMedia,
} from "@mui/material";
import { ModularRenderer } from "../../../libs/modular-renderer";
import { CompendiumItem, DataItem } from "../../../models/compendium";
import { AvatarItem } from "./avatar";
import { parseValueItem } from "../../../libs/modular-renderer/utility/parsers";

export function CompendiumItemRenderer(props: {
    renderer: CompendiumItem;
    data: DataItem;
    setExpanded: (value: DataItem | null) => void;
}): JSX.Element {
    const slug = parseValueItem(props.renderer.slug, props.data).result;
    return (
        <Card className="compendium-item" id={slug}>
            <CardActionArea onClick={() => props.setExpanded(props.data)}>
                <CardHeader
                    avatar={
                        props.renderer.avatar && (
                            <AvatarItem
                                data={props.data}
                                spec={props.renderer.avatar}
                            />
                        )
                    }
                    title={
                        parseValueItem(props.renderer.displayName, props.data)
                            .result
                    }
                    subheader={
                        parseValueItem(props.renderer.source, props.data).result
                    }
                />
                {props.renderer.media && (
                    <CardMedia
                        component="img"
                        image={
                            parseValueItem(
                                props.renderer.media.source,
                                props.data
                            ).result
                        }
                        alt={
                            parseValueItem(props.renderer.media.alt, props.data)
                                .result
                        }
                    />
                )}
                <CardContent>
                    <ModularRenderer
                        id={`compendium-item-${slug}`}
                        data={props.data}
                        renderer={{
                            supertype: "render",
                            type: "group",
                            children: props.renderer.briefContents,
                        }}
                    />
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
