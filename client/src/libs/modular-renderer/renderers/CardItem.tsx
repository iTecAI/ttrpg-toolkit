import { Card, CardContent, CardHeader, CardMedia } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import RenderItem from "../RenderItem";
import { RenderCardItem } from "../types/renderTypes";
import { ModularAvatar } from "./common";
import { useValueItem } from "../utility/hooks";

export const CardItem: RendererFunction<RenderCardItem> = (
    props: RendererFunctionProps<RenderCardItem>
) => {
    const { renderer, data, formData } = props;
    const title = renderer.title ?? { title: "" };
    const variant = renderer.variant ?? "elevation";
    const icon = title.icon ? <ModularAvatar item={title.icon} /> : undefined;
    const media = renderer.media ?? undefined;
    const children = renderer.children ?? [];

    const tit_title = useValueItem(title ? title.title : "", data);
    const tit_sub = useValueItem(
        title && title.subtitle ? title.subtitle : "",
        data
    );
    const med_src = useValueItem(media ? media.src : "", data);
    const med_alt = useValueItem(media ? media.alt : "", data);

    return (
        <Card className="render-item child card" variant={variant}>
            {title && (
                <CardHeader
                    avatar={icon}
                    title={title.title && tit_title}
                    subheader={title.subtitle && tit_sub}
                />
            )}
            {media && (
                <CardMedia
                    component="img"
                    height={media.height ?? undefined}
                    image={med_src}
                    alt={med_alt}
                />
            )}
            <CardContent>
                <RenderItem
                    renderer={children}
                    dataOverride={data}
                    formDataOverride={formData}
                />
            </CardContent>
        </Card>
    );
};
