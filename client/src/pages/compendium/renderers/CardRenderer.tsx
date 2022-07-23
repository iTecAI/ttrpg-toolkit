import {
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    CardMedia,
    Paper,
} from "@mui/material";
import Masonry from "react-masonry-css";
import {
    CardRendererModel,
    ContentSegment,
    DataItem,
} from "../../../models/compendium";
import AbstractIcon from "../../../util/AbstractIcon";
import { getNested, renderText } from "./renderUtils";

function ContentSegmentItem(props: {
    segment: ContentSegment;
    data: DataItem;
}) {
    let doRender: boolean;
    if (props.segment.conditional) {
        let processedVars: { [key: string]: any } = {};
        for (let v of Object.keys(props.segment.conditional.options)) {
            processedVars[v] = getNested(
                props.data,
                props.segment.conditional.options[v]
            );
        }
        // eslint-disable-next-line
        const func = new Function(
            "options",
            `"use strict";return (${props.segment.conditional.function})(options)`
        );
        doRender = func(processedVars) as boolean;
    } else {
        doRender = true;
    }
    return doRender ? (
        <Paper variant="outlined" className="content-segment">
            {props.segment.icon ? (
                <AbstractIcon
                    className="segment-icon"
                    type={props.segment.icon.group}
                    name={props.segment.icon.name}
                />
            ) : null}
            <span className="segment-title">
                {renderText(props.data, props.segment.name)}
            </span>
            <span className="segment-value">
                {renderText(props.data, props.segment.content)}
            </span>
        </Paper>
    ) : null;
}

export default function CardRenderer(props: {
    data: DataItem;
    renderer: CardRendererModel;
}) {
    return (
        <Card className="compendium-card">
            <CardActionArea>
                <CardHeader
                    title={renderText(props.data, props.renderer.title)}
                    subheader={
                        props.renderer.subtitle
                            ? renderText(props.data, props.renderer.subtitle)
                            : undefined
                    }
                />
                {props.renderer.image ? (
                    <CardMedia
                        src={renderText(props.data, props.renderer.image)}
                    />
                ) : null}
                <CardContent className="content">
                    {props.renderer.content.type === "text" ? (
                        renderText(props.data, props.renderer.content.text)
                    ) : (
                        <Masonry
                            className="content-masonry"
                            columnClassName="content-column"
                            breakpointCols={
                                props.renderer.content.count_per_row
                            }
                        >
                            {props.renderer.content.segments.map((segment) => (
                                <ContentSegmentItem
                                    key={renderText(props.data, segment.name)}
                                    segment={segment}
                                    data={props.data}
                                />
                            ))}
                        </Masonry>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
