import {
    Autocomplete,
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
    TextField,
    Tooltip,
} from "@mui/material";
import { MinimalContentType } from "../../../models/content";
import "./renderers.scss";
import {
    MdCheck,
    MdClear,
    MdDelete,
    MdDescription,
    MdFolder,
    MdMenu,
    MdPersonAdd,
    MdSettings,
    MdTag,
    MdUploadFile,
} from "react-icons/md";
import { ReactNode, useEffect, useState } from "react";
import { Box } from "@mui/system";
import { calculateGravatar } from "../../../util/gravatar";
import { loc } from "../../../util/localization";
import { useHorizontalScroll } from "../../../util/hscroll";
import { ConfirmDeleteDialog } from "../dialogs/confirmDeleteDialog";
import { post, postFile } from "../../../util/api";
import { ShareDialog } from "../dialogs/shareDialog";

function GenericRenderer(props: {
    item: MinimalContentType;
    body?: ReactNode;
    icon?: ReactNode;
    onDelete: (item: MinimalContentType) => void;
}): JSX.Element {
    const { item, icon } = props;
    const scrollRef = useHorizontalScroll(0.25);

    const [editName, setEditName] = useState<string>(item.name);
    const [nameLoading, setNameLoading] = useState<boolean>(false);
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        setEditName(item.name);
        setNameLoading(false);
        setTags(item.tags);
    }, [item]);

    const [sharing, setSharing] = useState<boolean>(false);

    return (
        <Card variant="outlined" className="render-item">
            <Stack className="actions" spacing={1} direction="row">
                {item.shared.share && (
                    <Tooltip
                        title={loc("content.universal.actions.share")}
                        placement="bottom"
                        disableInteractive
                        onClick={() => setSharing(true)}
                    >
                        <IconButton className="share">
                            <MdPersonAdd size={18} />
                        </IconButton>
                    </Tooltip>
                )}
                {item.shared.delete && (
                    <Tooltip
                        title={loc("content.universal.actions.delete")}
                        placement="bottom"
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

                <CardHeader
                    title={
                        item.shared.edit ? (
                            <Box className="title-edit-container">
                                <TextField
                                    value={editName}
                                    onChange={(event) =>
                                        setEditName(event.target.value)
                                    }
                                    error={editName.length === 0}
                                    variant="standard"
                                    className="title-edit"
                                    size="small"
                                />
                                {editName !== item.name &&
                                    editName.length > 0 &&
                                    (nameLoading ? (
                                        <CircularProgress
                                            style={{
                                                width: "24px",
                                                height: "24px",
                                                marginTop: "-11px",
                                                marginLeft: "-8px",
                                            }}
                                            className="finish"
                                        />
                                    ) : (
                                        <IconButton
                                            size="small"
                                            className="finish"
                                            color="success"
                                            onClick={() => {
                                                if (
                                                    editName.length > 0 &&
                                                    item.shared.edit
                                                ) {
                                                    setNameLoading(true);
                                                    post<MinimalContentType>(
                                                        `/content/${item.oid}/modify/name`,
                                                        { body: editName }
                                                    );
                                                }
                                            }}
                                        >
                                            <MdCheck />
                                        </IconButton>
                                    ))}
                            </Box>
                        ) : (
                            item.name
                        )
                    }
                />
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
                    {item.shared.edit && (
                        <Stack direction="row" spacing={2} className="img-edit">
                            <Tooltip
                                title={loc(
                                    "content.universal.actions.edit.image.change"
                                )}
                            >
                                <Box className="file-upload">
                                    <IconButton className="img-change">
                                        <MdUploadFile />
                                    </IconButton>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => {
                                            if (
                                                event.target.files &&
                                                event.target.files.length > 0
                                            ) {
                                                postFile<{ itemId: string }>(
                                                    "/user_content",
                                                    {
                                                        body: event.target
                                                            .files[0],
                                                    }
                                                ).then((result) => {
                                                    if (result.success) {
                                                        post<MinimalContentType>(
                                                            `/content/${item.oid}/modify/image`,
                                                            {
                                                                body: result
                                                                    .value
                                                                    .itemId,
                                                            }
                                                        );
                                                    }
                                                });
                                            }
                                        }}
                                    />
                                </Box>
                            </Tooltip>
                            <Tooltip
                                title={loc(
                                    "content.universal.actions.edit.image.clear"
                                )}
                            >
                                <IconButton
                                    className="img-delete"
                                    onClick={() =>
                                        post<MinimalContentType>(
                                            `/content/${item.oid}/modify/image`,
                                            { body: null }
                                        )
                                    }
                                >
                                    <MdClear />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    )}
                </Box>
                <CardContent className="content">
                    {item.shared.edit ? (
                        <Autocomplete
                            freeSolo
                            multiple
                            options={[]}
                            size="medium"
                            renderInput={(params) => {
                                return (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <>
                                                    <MdTag size={16} />
                                                    {
                                                        params.InputProps
                                                            .startAdornment
                                                    }
                                                </>
                                            ),
                                        }}
                                    />
                                );
                            }}
                            className="tags-edit"
                            value={tags}
                            onChange={(event, value) => {
                                setTags(value as string[]);
                                post<MinimalContentType>(
                                    `/content/${item.oid}/modify/tags`,
                                    { body: value }
                                );
                            }}
                            renderTags={(value, getTagProps) =>
                                (value as any).map(
                                    (option: string, index: number) => (
                                        <Chip
                                            size="small"
                                            label={option}
                                            {...getTagProps({ index })}
                                        />
                                    )
                                )
                            }
                        />
                    ) : (
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
                    )}
                </CardContent>
            </Box>
            <ShareDialog item={item} open={sharing} setOpen={setSharing} />
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
