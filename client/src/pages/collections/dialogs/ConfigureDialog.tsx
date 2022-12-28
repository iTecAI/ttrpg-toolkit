import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { MinimalCollection } from "../../../models/collection";
import { loc } from "../../../util/localization";
import { useEffect, useReducer, useState } from "react";
import {
    MdDescription,
    MdDriveFileRenameOutline,
    MdHideImage,
    MdImage,
    MdTag,
} from "react-icons/md";
import "./configure.scss";
import { post, postFile } from "../../../util/api";
import { useSnackbar } from "notistack";

type ConfigureState = {
    name: string;
    description: string;
    image: string | null;
    tags: string[];
};

export function ConfigureDialog(props: {
    collection: MinimalCollection;
    open: boolean;
    setOpen: (open: boolean) => void;
}): JSX.Element {
    function close() {
        props.setOpen(false);
        setNameError(false);
        setNewFile(null);
    }

    function submit(image?: string) {
        post<MinimalCollection>(
            `/collections/${props.collection.collectionId}/configure`,
            {
                body: {
                    name:
                        form.name === props.collection.name
                            ? undefined
                            : form.name,
                    description:
                        form.description === props.collection.description
                            ? undefined
                            : form.description,
                    image: image
                        ? `/api/user_content/${image}`
                        : form.image === "$remove"
                        ? "$remove"
                        : "",
                    tags:
                        form.tags === props.collection.tags
                            ? undefined
                            : form.tags,
                },
            }
        );
        close();
    }

    function reduceForm(
        state: ConfigureState,
        action:
            | { key: keyof ConfigureState; value: any }
            | { key: "set"; value: ConfigureState }
    ) {
        if (action.key === "set") {
            return action.value;
        } else {
            const newState = { ...state };
            newState[action.key] = action.value;
            return newState;
        }
    }

    const [form, dispatchForm] = useReducer(reduceForm, {
        name: props.collection.name,
        description: props.collection.description ?? "",
        image: props.collection.image,
        tags: props.collection.tags,
    });
    const [newFile, setNewFile] = useState<File | null>(null);
    const [nameError, setNameError] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (props.open) {
            dispatchForm({
                key: "set",
                value: {
                    name: props.collection.name,
                    description: props.collection.description ?? "",
                    image: props.collection.image,
                    tags: props.collection.tags,
                },
            });
        }
    }, [props.open]);

    return (
        <Dialog open={props.open} onClose={close} fullWidth maxWidth={"md"}>
            <DialogTitle>
                {loc("collections.list.item.configure.title")}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <TextField
                        sx={{ marginTop: "8px" }}
                        fullWidth
                        value={form.name}
                        onChange={(event) =>
                            dispatchForm({
                                key: "name",
                                value: event.target.value,
                            })
                        }
                        label={loc("collections.dialog.field-name")}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdDriveFileRenameOutline size={16} />
                                </InputAdornment>
                            ),
                        }}
                        error={nameError}
                        helperText={
                            nameError &&
                            loc("generic.required", {
                                field: loc("collections.dialog.field-name"),
                            })
                        }
                    />
                    <TextField
                        sx={{ marginTop: "8px" }}
                        fullWidth
                        value={form.description}
                        onChange={(event) =>
                            dispatchForm({
                                key: "description",
                                value: event.target.value,
                            })
                        }
                        label={loc("collections.dialog.field-desc")}
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
                                    display: form.image
                                        ? "none"
                                        : "inline-block",
                                }}
                                onChange={(event) => {
                                    if (
                                        event.target.files &&
                                        event.target.files.length > 0
                                    ) {
                                        setNewFile(
                                            event.target.files[0] ?? null
                                        );
                                        if (event.target.files[0] ?? null) {
                                            const reader = new FileReader();
                                            reader.addEventListener(
                                                "load",
                                                () =>
                                                    dispatchForm({
                                                        key: "image",
                                                        value: reader.result,
                                                    })
                                            );
                                            reader.readAsDataURL(
                                                event.target.files[0] ?? null
                                            );
                                        }
                                    }
                                }}
                            />
                        </Tooltip>
                        {form.image && form.image !== "$remove" ? (
                            <span className="file-preview">
                                <img src={form.image} alt="" />
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
                                            setNewFile(null);
                                            dispatchForm({
                                                key: "image",
                                                value: "$remove",
                                            });
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
                        value={form.tags}
                        onChange={(_, value) =>
                            dispatchForm({
                                key: "tags",
                                value: value as string[],
                            })
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
                <Button variant={"outlined"} onClick={close}>
                    {loc("generic.cancel")}
                </Button>
                <Button
                    variant={"contained"}
                    onClick={() => {
                        if (form.name.length === 0) {
                            setNameError(true);
                            return;
                        }
                        setNameError(false);
                        if (newFile !== null) {
                            postFile<{ itemId: string }>("/user_content/", {
                                body: newFile,
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
                    {loc("generic.submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
