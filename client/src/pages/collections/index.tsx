import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Fab,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdAdd,
    MdDescription,
    MdDriveFileRenameOutline,
    MdHideImage,
    MdImage,
    MdStar,
    MdTag,
} from "react-icons/md";
import "./index.scss";
import { loc } from "../../util/localization";
import { useEffect, useState } from "react";
import { get, post, postFile } from "../../util/api";
import { useSnackbar } from "notistack";
import { MinimalCollection } from "../../models/collection";
import { UpdateType, useUpdate } from "../../util/updates";
import { Masonry } from "@mui/lab";
import { Md5 } from "ts-md5";

function CreateCollectionDialog(props: {
    open: boolean;
    setOpen: (open: boolean) => void;
    onCreate: () => void;
}): JSX.Element {
    const [name, setName] = useState<string>("");
    const [nameError, setNameError] = useState<boolean>(false);
    const [desc, setDesc] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [prev, setPrev] = useState<string | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    function close() {
        props.setOpen(false);
        setName("");
        setDesc("");
        setTags([]);
        setFile(null);
        setPrev(null);
        setNameError(false);
    }

    function submit(img?: string) {
        post<MinimalCollection>("/collections/", {
            body: {
                name: name,
                description: desc,
                image: img ? `/api/user_content/${img}` : "",
                tags: tags,
            },
        }).then((result) => {
            if (result.success) {
                props.onCreate();
            }
        });
        close();
    }

    return (
        <Dialog
            open={props.open}
            onClose={close}
            className="dialog-new-collection"
            maxWidth={"md"}
            fullWidth={true}
        >
            <DialogTitle>
                <MdAdd size={24} className={"title-icon"} />
                {loc("collections.dialog.title")}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {loc("collections.dialog.desc")}
                </DialogContentText>
                <Divider variant="middle" sx={{ marginTop: "8px" }} />
                <Stack className="form-area" spacing={2}>
                    <TextField
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        label={loc("collections.dialog.field-name")}
                        fullWidth
                        error={nameError}
                        helperText={
                            nameError &&
                            loc("generic.required", {
                                field: loc("collections.dialog.field-name"),
                            })
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdDriveFileRenameOutline size={16} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        value={desc}
                        onChange={(event) => setDesc(event.target.value)}
                        label={loc("collections.dialog.field-desc")}
                        fullWidth
                        multiline
                        minRows={2}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdDescription size={16} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Box className="file-input">
                        <Tooltip
                            title={loc("collections.dialog.field-file-tooltip")}
                            placement="top"
                        >
                            <input
                                type={"file"}
                                style={{
                                    display: prev ? "none" : "inline-block",
                                }}
                                onChange={(event) => {
                                    if (
                                        event.target.files &&
                                        event.target.files.length > 0
                                    ) {
                                        setFile(event.target.files[0] ?? null);
                                        if (event.target.files[0] ?? null) {
                                            const reader = new FileReader();
                                            reader.addEventListener(
                                                "load",
                                                () =>
                                                    setPrev(
                                                        reader.result as string
                                                    )
                                            );
                                            reader.readAsDataURL(
                                                event.target.files[0] ?? null
                                            );
                                        }
                                    }
                                }}
                            />
                        </Tooltip>
                        {prev ? (
                            <span className="file-preview">
                                <img src={prev} alt="" />
                                <Tooltip
                                    title={loc(
                                        "collections.dialog.field-file-clear"
                                    )}
                                    placement={"left"}
                                >
                                    <Fab
                                        color="default"
                                        className="clear-btn"
                                        size={"medium"}
                                        onClick={() => {
                                            setFile(null);
                                            setPrev(null);
                                        }}
                                    >
                                        <MdHideImage size={16} />
                                    </Fab>
                                </Tooltip>
                            </span>
                        ) : (
                            <span className="file-icon">
                                <MdImage size={32} />
                                <Typography className="text" variant="overline">
                                    {loc("collections.dialog.field-file")}
                                </Typography>
                            </span>
                        )}
                    </Box>
                    <Autocomplete
                        value={tags}
                        onChange={(_, value) =>
                            typeof value === "string"
                                ? setTags([value])
                                : setTags(value as string[])
                        }
                        fullWidth
                        multiple
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={loc("collections.dialog.field-tags")}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <InputAdornment position="start">
                                                <MdTag size={16} />
                                            </InputAdornment>
                                            {params.InputProps.startAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        options={[]}
                        freeSolo
                        renderTags={(tagValue, getTagProps) =>
                            tagValue.map((option, index) => (
                                <Chip
                                    label={option}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button size="large" variant="outlined" onClick={close}>
                    {loc("generic.cancel")}
                </Button>
                <Button
                    size="large"
                    variant="contained"
                    onClick={() => {
                        if (name.length === 0) {
                            setNameError(true);
                            return;
                        }
                        if (file !== null) {
                            postFile<{ itemId: string }>("/user_content/", {
                                body: file,
                            }).then((value) => {
                                if (value.success) {
                                    submit(value.value.itemId);
                                } else {
                                    enqueueSnackbar(
                                        loc(
                                            "collections.dialog.error-image-failed",
                                            { detail: value.messageClass }
                                        ),
                                        { variant: "error" }
                                    );
                                }
                            });
                        } else {
                            submit();
                        }
                    }}
                >
                    {loc("generic.create")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function CollectionItem(props: { item: MinimalCollection }): JSX.Element {
    const { item } = props;
    return (
        <Card className="collection">
            {item.permissions.includes("owner") && (
                <Tooltip
                    title={loc("collections.permissions.owner.name")}
                    disableInteractive
                >
                    <span className="perm-icon">
                        <MdStar size={24} color="gold" />
                    </span>
                </Tooltip>
            )}
            <CardHeader title={item.name} />
            {item.image ? (
                <CardMedia
                    component="img"
                    image={item.image}
                    alt={loc("collections.list.item.media-alt", {
                        name: item.name,
                    })}
                    height={320}
                />
            ) : (
                <CardMedia
                    component="img"
                    image={`https://www.gravatar.com/avatar/${Md5.hashStr(
                        item.collectionId
                    )}?d=identicon&f=y&s=1024`}
                    alt={loc("collections.list.item.media-alt", {
                        name: item.name,
                    })}
                    height={320}
                    sx={{
                        filter: "grayscale(1)",
                        opacity: 0.5,
                    }}
                />
            )}
            <CardContent>
                {item.description}
                <Paper variant="outlined" className="tag-area">
                    {item.tags.length ? (
                        <Stack spacing={1} direction={"row"}>
                            {item.tags.map((t) => (
                                <Chip label={t} key={t} />
                            ))}
                        </Stack>
                    ) : (
                        loc("collections.list.item.tags-empty")
                    )}
                </Paper>
            </CardContent>
        </Card>
    );
}

export function Collections(): JSX.Element {
    const [creating, setCreating] = useState<boolean>(false);
    const [collections, setCollections] = useState<MinimalCollection[]>([]);
    useUpdate(
        (update: UpdateType) =>
            get<MinimalCollection[]>("/collections/").then((result) => {
                if (result.success) {
                    setCollections(result.value);
                }
            }),
        "collections.new"
    );

    useEffect(() => {
        get<MinimalCollection[]>("/collections/").then((result) => {
            if (result.success) {
                setCollections(result.value);
            }
        });
    }, []);

    return (
        <Box className="collections-area">
            <Tooltip title={loc("collections.new")}>
                <Fab
                    className="btn-new-collection"
                    color="primary"
                    size="large"
                    onClick={() => setCreating(true)}
                >
                    <MdAdd size={24} />
                </Fab>
            </Tooltip>
            <CreateCollectionDialog
                open={creating}
                setOpen={(open: boolean) => setCreating(open)}
                onCreate={() =>
                    get<MinimalCollection[]>("/collections/").then((result) => {
                        if (result.success) {
                            setCollections(result.value);
                        }
                    })
                }
            />
            <Masonry
                spacing={2}
                columns={Math.ceil(window.innerWidth / 480)}
                className={"collections-list"}
            >
                {collections.map((c) => (
                    <CollectionItem item={c} key={c.collectionId} />
                ))}
            </Masonry>
        </Box>
    );
}
