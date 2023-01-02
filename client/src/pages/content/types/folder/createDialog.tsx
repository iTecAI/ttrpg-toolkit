import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { loc } from "../../../../util/localization";
import { useState } from "react";
import { UniversalCreateForm } from "../../util";
import { post, postFile } from "../../../../util/api";

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

    function submit() {
        if (name.length === 0) {
            return;
        }
        let createdImage: string | null = null;
        if (image) {
            postFile<{ itemId: string }>("/user_content/", {
                body: image,
            }).then((result) => {
                if (result.success) {
                    createdImage = result.value.itemId;
                }

                post("/content/folder", {
                    urlParams: {
                        parent: props.parent,
                    },
                    body: {
                        name: name,
                        image: createdImage ?? undefined,
                        tags: tags,
                    },
                }).then((result) => console.log(result));
            });
        } else {
            post("/content/folder", {
                urlParams: {
                    parent: props.parent,
                },
                body: {
                    name: name,
                    image: createdImage ?? undefined,
                    tags: tags,
                },
            }).then((result) => console.log(result));
        }

        close();
    }

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
            <DialogActions>
                <Button variant="outlined" onClick={close}>
                    {loc("generic.cancel")}
                </Button>
                <Button variant="contained" onClick={submit}>
                    {loc("generic.submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
