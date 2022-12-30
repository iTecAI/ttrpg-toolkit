import { InputAdornment, TextField } from "@mui/material";
import { useState } from "react";
import { loc } from "../../util/localization";
import { MdDriveFileRenameOutline } from "react-icons/md";

export function UniversalCreateForm(props: {
    name: string;
    setName: (name: string) => void;
    image: string | null;
    setImage: (image: File) => void;
    tags: string[];
    setTags: (tags: string[]) => void;
}): JSX.Element {
    const { name, setName, image, setImage, tags, setTags } = props;
    const [prev, setPrev] = useState<string>(image ?? "");

    return (
        <>
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
        </>
    );
}
