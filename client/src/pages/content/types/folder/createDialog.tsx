import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { loc } from "../../../../util/localization";
import { useState } from "react";
import { UniversalCreateForm } from "../../util";

export function CreateFolderDialog(props: {
    parent: string;
    open: boolean;
    setOpen: (open: boolean) => void;
}): JSX.Element {
    function close() {
        props.setOpen(false);
        setName("New Folder");
        setImage(null);
        setTags([]);
    }

    const [name, setName] = useState<string>("New Folder");
    const [image, setImage] = useState<File | null>(null);
    const [tags, setTags] = useState<string[]>([]);

    return (
        <Dialog open={props.open} onClose={close} maxWidth="md" fullWidth>
            <DialogTitle>{loc("content.folder.create.title")}</DialogTitle>
            <DialogContent>
                <UniversalCreateForm
                    name={name}
                    setName={setName}
                    image={null}
                    setImage={setImage}
                    tags={tags}
                    setTags={setTags}
                />
            </DialogContent>
        </Dialog>
    );
}
