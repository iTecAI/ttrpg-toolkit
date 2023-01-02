import {
    Autocomplete,
    Chip,
    Fab,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { loc } from "../../util/localization";
import {
    MdAdd,
    MdClear,
    MdDriveFileRenameOutline,
    MdTag,
} from "react-icons/md";
import { Box } from "@mui/system";
import "./util.scss";

export function UniversalCreateForm(props: {
    name: string;
    setName: (name: string) => void;
    image: string | null;
    setImage: (image: File | null) => void;
    tags: string[];
    setTags: (tags: string[]) => void;
}): JSX.Element {
    const { name, setName, image, setImage, tags, setTags } = props;
    const [prev, setPrev] = useState<string | null>(image);

    return (
        <Stack spacing={2}>
            <TextField
                label={loc("content.universal.create_name")}
                sx={{ marginTop: "16px" }}
                error={name.length === 0}
                helperText={
                    name.length === 0 &&
                    loc("generic.required", {
                        filed: loc("content.universal.create_name"),
                    })
                }
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <MdDriveFileRenameOutline size={24} />
                        </InputAdornment>
                    ),
                }}
                fullWidth
                value={name}
                onChange={(event) => setName(event.target.value)}
            />
            <FilePickerInput
                prev={prev}
                setFile={(newPrev, newFile) => {
                    setPrev(newPrev);
                    setImage(newFile);
                }}
                mime="image/*"
            />
            <Autocomplete
                options={[]}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <>
                                    <InputAdornment position="start">
                                        <MdTag size={24} />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                </>
                            ),
                        }}
                        label={loc("content.universal.create_tags")}
                    />
                )}
                multiple
                value={tags as any}
                onChange={(event, value) => setTags(value)}
                freeSolo
                renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                        <Chip
                            size="small"
                            label={option}
                            {...getTagProps({ index })}
                        />
                    ))
                }
            />
        </Stack>
    );
}

export function FilePickerInput(props: {
    prev: string | null;
    setFile: (prev: string | null, file: File | null) => void;
    height?: number;
    mime?: string;
}): JSX.Element {
    return (
        <Box
            className="file-picker"
            sx={{ height: props.height ? `${props.height}px` : "256px" }}
        >
            <input
                type="file"
                style={{ display: props.prev ? "none" : "inline-block" }}
                onChange={(event) => {
                    if (event.target.files && event.target.files.length > 0) {
                        const reader = new FileReader();
                        reader.addEventListener("load", () => {
                            props.setFile(
                                reader.result as string,
                                event.target.files && event.target.files[0]
                            );
                        });
                        reader.readAsDataURL(event.target.files[0]);
                    } else {
                        props.setFile(null, null);
                    }
                }}
                className="input"
                accept={props.mime ?? undefined}
            />
            {props.prev ? (
                <Box className="image-prev">
                    <img src={props.prev} alt="" />
                    <Tooltip
                        title={loc("content.universal.file-picker.clear")}
                        placement="left"
                    >
                        <Fab
                            color="info"
                            size="small"
                            className="delete-btn"
                            onClick={() => props.setFile(null, null)}
                        >
                            <MdClear size={24} />
                        </Fab>
                    </Tooltip>
                </Box>
            ) : (
                <Box className="add-icon">
                    <MdAdd size={32} className="icon" />
                    <Typography variant="overline" className="text">
                        {loc("content.universal.file-picker.new")}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
