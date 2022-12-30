import {
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Chip,
    Paper,
    Stack,
} from "@mui/material";
import { MinimalContentType } from "../../../models/content";
import "./renderers.scss";
import { MdDescription, MdFolder, MdTag } from "react-icons/md";
import { ReactNode } from "react";
import { Box } from "@mui/system";
import { calculateGravatar } from "../../../util/gravatar";
import HorizontalScroll from "react-scroll-horizontal";

function GenericRenderer(props: {
    item: MinimalContentType;
    body?: ReactNode;
    icon?: ReactNode;
}): JSX.Element {
    const { item, body, icon } = props;
    return (
        <Card variant="outlined" className="render-item">
            <Box className="sizing-container">
                {icon ? (
                    <Box className="icon">{icon}</Box>
                ) : (
                    <Box className="icon">
                        <MdDescription size={24} />
                    </Box>
                )}
                <CardHeader title={item.name} />
                <Box className="media">
                    <CardMedia
                        src={
                            item.image
                                ? `/api/user_content/${item.image}`
                                : calculateGravatar(item.oid, 1024)
                        }
                        alt=""
                        component="img"
                    />
                    <Paper className="custom-content">{body}</Paper>
                </Box>
                <CardContent className="content">
                    <Paper variant="outlined" className="tag-area">
                        <Stack spacing={1} direction="row">
                            <MdTag className="tag-icon" size={24} />
                            <Stack
                                className="container"
                                spacing={1}
                                direction="row"
                            >
                                <HorizontalScroll reverseScroll>
                                    {item.tags.map((v) => (
                                        <Chip size="small" key={v} label={v} />
                                    ))}
                                </HorizontalScroll>
                            </Stack>
                        </Stack>
                    </Paper>
                </CardContent>
            </Box>
        </Card>
    );
}

function RenderFolder(props: { item: MinimalContentType }): JSX.Element {
    return <GenericRenderer item={props.item} icon={<MdFolder size={24} />} />;
}

export const RENDERERS: {
    [key: string]: (props: { item: MinimalContentType }) => JSX.Element;
} = {
    folder: RenderFolder,
};
