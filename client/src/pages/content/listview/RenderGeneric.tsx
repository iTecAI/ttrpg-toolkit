import {
    Avatar,
    Badge,
    Chip,
    Fab,
    IconButton,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { MinimalContentType } from "../../../models/content";
import { calculateGravatar } from "../../../util/gravatar";
import "./generic.scss";
import { Box } from "@mui/system";
import { MdDelete, MdPersonAdd, MdSettings } from "react-icons/md";
import { useState } from "react";
import { ShareDialog } from "../dialogs/shareDialog";
import { useHorizontalScroll } from "../../../util/hscroll";
import { useParams } from "react-router";

export function RenderGeneric(props: {
    item: MinimalContentType;
    badge: JSX.Element;
    delete: (item: MinimalContentType) => void;
}): JSX.Element {
    const { item, badge } = props;
    const [sharing, setSharing] = useState<boolean>(false);
    const tagRef = useHorizontalScroll(0.25);
    const { id } = useParams();
    return (
        <Paper
            className={`generic-renderer${id === item.oid ? " selected" : ""}`}
            elevation={3}
        >
            <Avatar
                component={"image"}
                src={
                    item.image
                        ? `/api/user_content/${item.image}`
                        : calculateGravatar(item.oid, 128)
                }
                className="avatar"
            />
            <Typography variant="h5" className="content-name">
                <Box
                    sx={{
                        width: "20px",
                        height: "20px",
                        "& svg": { color: "white" },
                    }}
                    className="badge"
                >
                    {badge}
                </Box>
                {item.name}
            </Typography>
            <Stack spacing={0.5} direction="row" className="tags" ref={tagRef}>
                {item.tags.map((t) => (
                    <Chip size="small" label={t} key={t} />
                ))}
            </Stack>
            <Stack spacing={0.5} direction="row" className="actions">
                {item.shared.edit && (
                    <Fab
                        className="btn settings"
                        color="info"
                        onClick={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        <MdSettings size={18} />
                    </Fab>
                )}
                {item.shared.share && (
                    <Fab
                        className="btn share"
                        color="info"
                        onClick={(event) => {
                            setSharing(true);
                            event.stopPropagation();
                        }}
                    >
                        <MdPersonAdd size={18} />
                    </Fab>
                )}
                {item.shared.delete && (
                    <Fab
                        className="btn delete"
                        color="info"
                        onClick={(event) => {
                            props.delete(item);
                            event.stopPropagation();
                        }}
                    >
                        <MdDelete size={18} />
                    </Fab>
                )}
            </Stack>
            <ShareDialog item={item} open={sharing} setOpen={setSharing} />
        </Paper>
    );
}