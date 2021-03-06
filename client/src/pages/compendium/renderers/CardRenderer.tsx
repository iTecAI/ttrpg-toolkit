import {
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    CardMedia,
    Dialog,
    Paper,
} from "@mui/material";
import Masonry from "react-masonry-css";
import {
    CardExpandedModel,
    CardRendererModel,
    ContentSegment,
    DataItem,
} from "../../../models/compendium";
import AbstractIcon from "../../../util/AbstractIcon";
import {
    dynamicFunction,
    getNested,
    parseOptionsDynamicFunction,
    renderText,
} from "./renderUtils";

function ContentSegmentItem(props: {
    segment: ContentSegment;
    data: DataItem;
}) {
    let doRender: boolean;
    if (props.segment.conditional) {
        doRender = parseOptionsDynamicFunction(
            props.segment.conditional.function,
            props.segment.conditional.options,
            props.data
        );
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
    onExpand: () => void;
}) {
    return (
        <>
            <Card className="compendium-card">
                <CardActionArea onClick={() => props.onExpand()}>
                    <CardHeader
                        title={renderText(props.data, props.renderer.title)}
                        subheader={
                            props.renderer.subtitle
                                ? renderText(
                                      props.data,
                                      props.renderer.subtitle
                                  )
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
                                {props.renderer.content.segments.map(
                                    (segment) => (
                                        <ContentSegmentItem
                                            key={renderText(
                                                props.data,
                                                segment.name
                                            )}
                                            segment={segment}
                                            data={props.data}
                                        />
                                    )
                                )}
                            </Masonry>
                        )}
                    </CardContent>
                </CardActionArea>
            </Card>
        </>
    );
}
