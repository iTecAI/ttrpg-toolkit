import {
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    CardMedia,
} from "@mui/material";
import { MuiRenderParser, ModularRenderer } from "../../../libs/modoc";
import { parseValueItemNoForm } from "../../../libs/modoc/util/valueItemParser";
import { CompendiumItem, DataItem } from "../../../models/compendium";
import { AvatarItem } from "./avatar";

export function CompendiumItemRenderer(props: {
    renderer: CompendiumItem;
    data: DataItem;
    setExpanded: (value: DataItem | null) => void;
}): JSX.Element {
    return (
        <Card
            className="compendium-item"
            id={parseValueItemNoForm(props.renderer.slug, props.data)}
        >
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
                    title={parseValueItemNoForm(
                        props.renderer.displayName,
                        props.data
                    )}
                    subheader={parseValueItemNoForm(
                        props.renderer.source,
                        props.data
                    )}
                />
                {props.renderer.media && (
                    <CardMedia
                        component="img"
                        image={parseValueItemNoForm(
                            props.renderer.media.source,
                            props.data
                        )}
                        alt={parseValueItemNoForm(
                            props.renderer.media.alt,
                            props.data
                        )}
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
            </CardActionArea>
        </Card>
    );
}
