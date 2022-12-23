import {
    Autocomplete,
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Fab,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
} from "@mui/material";
import {
    MdAdd,
    MdDescription,
    MdDriveFileRenameOutline,
    MdTag,
} from "react-icons/md";
import "./index.scss";
import { loc } from "../../util/localization";
import { useState } from "react";

function CreateCollectionDialog(props: {
    open: boolean;
    setOpen: (open: boolean) => void;
}): JSX.Element {
    const [name, setName] = useState<string>("");
    const [desc, setDesc] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);

    return (
        <Dialog
            open={props.open}
            onClose={() => props.setOpen(false)}
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
                        minRows={4}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdDescription size={16} />
                                </InputAdornment>
                            ),
                        }}
                    />
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
        </Dialog>
    );
}

export function Collections(): JSX.Element {
    const [creating, setCreating] = useState<boolean>(false);

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
            />
        </Box>
    );
}
