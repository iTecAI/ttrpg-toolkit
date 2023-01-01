import { Dialog, DialogTitle } from "@mui/material";
import { MinimalContentType } from "../../../models/content";
import { loc } from "../../../util/localization";

export function ShareDialog(props: {
    item: MinimalContentType;
    open: boolean;
    setOpen: (open: boolean) => void;
}): JSX.Element {
    function close() {
        props.setOpen(false);
    }

    return (
        <Dialog
            className="content-share-dialog"
            open={props.open}
            onClose={close}
        >
            <DialogTitle>
                {loc("content.universal.dialogs.share.title")}
            </DialogTitle>
        </Dialog>
    );
}
