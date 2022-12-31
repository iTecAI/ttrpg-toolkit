import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Chip,
    CircularProgress,
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
import { ReactNode, useState } from "react";
import { Box } from "@mui/system";
import { calculateGravatar } from "../../../util/gravatar";
import { loc } from "../../../util/localization";
import { useHorizontalScroll } from "../../../util/hscroll";
import { ConfirmDeleteDialog } from "../dialogs/confirmDeleteDialog";

function GenericRenderer(props: {
    item: MinimalContentType;
    body?: ReactNode;
    icon?: ReactNode;
    onDelete: (item: MinimalContentType) => void;
}): JSX.Element {
    const { item, body, icon } = props;
    const scrollRef = useHorizontalScroll(0.25);

    return (
        <Card variant="outlined" className="render-item">
            <Stack className="actions" spacing={1} direction="column">
                {item.shared.share && (
                    <Tooltip
                        title={loc("content.universal.actions.share")}
                        placement="left"
                        disableInteractive
                    >
                        <IconButton className="share">
                            <MdPersonAdd size={18} />
                        </IconButton>
                    </Tooltip>
                )}
                {item.shared.edit && (
                    <Tooltip
                        title={loc("content.universal.actions.configure")}
                        placement="left"
                        disableInteractive
                    >
                        <IconButton className="configure">
                            <MdSettings size={18} />
                        </IconButton>
                    </Tooltip>
                )}
                {item.shared.delete && (
                    <Tooltip
                        title={loc("content.universal.actions.delete")}
                        placement="left"
                        disableInteractive
                    >
                        <IconButton
                            onClick={() => {
                                props.onDelete(item);
                            }}
                            className="delete"
                        >
                            <MdDelete size={18} />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>
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
                                spacing={0.5}
                                direction="row"
                                ref={scrollRef}
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

function RenderFolder(props: {
    item: MinimalContentType;
    onDelete: (item: MinimalContentType) => void;
}): JSX.Element {
    return (
        <GenericRenderer
            item={props.item}
            icon={<MdFolder size={24} />}
            onDelete={props.onDelete}
        />
    );
}

export const RENDERERS: {
    [key: string]: (props: {
        item: MinimalContentType;
        onDelete: (item: MinimalContentType) => void;
    }) => JSX.Element;
} = {
    folder: RenderFolder,
};
