import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { MinimalContentType } from "../../../models/content";
import { loc } from "../../../util/localization";
import { UniversalCreateForm } from "../util";
import { useEffect, useState } from "react";
import { post, postFile } from "../../../util/api";

export function ConfigDialog(props: {
    item: MinimalContentType;
    open: boolean;
    setOpen: (open: boolean) => void;
}): JSX.Element {
    function close() {
        props.setOpen(false);
    }

    const [name, setName] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const [prev, setPrev] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);

    function submit() {
        if (name.length === 0) {
            return;
        }
        let createdImage: string | null = null;
        if (
            image &&
            prev !==
                (props.item.image
                    ? `/api/user_content/${props.item.image}`
                    : null)
        ) {
            postFile<{ itemId: string }>("/user_content/", {
                body: image,
            }).then((result) => {
                if (result.success) {
                    createdImage = result.value.itemId;
                }

                post(`/content/${props.item.oid}/modify/image`, {
                    body: createdImage,
                }).then((result) => console.log(result));
            });
        }
        if (name !== props.item.name) {
            post(`/content/${props.item.oid}/modify/name`, {
                body: name,
            }).then((result) => console.log(result));
        }
        if (JSON.stringify(tags) !== JSON.stringify(props.item.tags)) {
            post(`/content/${props.item.oid}/modify/tags`, {
                body: tags,
            }).then((result) => console.log(result));
        }

        close();
    }

    useEffect(() => {
        setName(props.item.name);
        setTags(props.item.tags);
        setPrev(
            props.item.image ? `/api/user_content/${props.item.image}` : null
        );
        setImage(null);
    }, [props]);

    return (
        <Dialog open={props.open} onClose={close} maxWidth="md" fullWidth>
            <DialogTitle>
                {loc("content.universal.dialogs.config.title", {
                    name: props.item.name,
                })}
            </DialogTitle>
            <DialogContent>
                <UniversalCreateForm
                    name={name}
                    setName={setName}
                    tags={tags}
                    setTags={setTags}
                    image={prev}
                    setImage={setImage}
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
