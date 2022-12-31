import {
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Chip,
    IconButton,
    Paper,
    SpeedDial,
    SpeedDialAction,
    Stack,
    Tooltip,
} from "@mui/material";
import { MinimalContentType } from "../../../models/content";
import "./renderers.scss";
import {
    MdDelete,
    MdDescription,
    MdFolder,
    MdMenu,
    MdPersonAdd,
    MdSettings,
    MdTag,
} from "react-icons/md";
import { ReactNode } from "react";
import { Box } from "@mui/system";
import { calculateGravatar } from "../../../util/gravatar";
import { loc } from "../../../util/localization";

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
                <Stack className="actions" spacing={1} direction="column">
                    <Tooltip
                        title={loc("content.universal.actions.share")}
                        placement="left"
                    >
                        <IconButton size="small">
                            <MdPersonAdd size={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title={loc("content.universal.actions.configure")}
                        placement="left"
                    >
                        <IconButton size="small">
                            <MdSettings size={18} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title={loc("content.universal.actions.delete")}
                        placement="left"
                    >
                        <IconButton size="small">
                            <MdDelete size={18} />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <CardHeader title={item.name} />
                <Box className="media">
                    <CardMedia
                        src={
                            item.image
                                ? `/api/user_content/${item.image}`
                                : calculateGravatar(item.oid, 256)
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
                                {item.tags.map((v) => (
                                    <Chip size="small" key={v} label={v} />
                                ))}
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
