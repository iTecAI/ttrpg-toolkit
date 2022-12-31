import { useEffect, useState } from "react";
import { MinimalContentType } from "../../../models/content";
import { del, get } from "../../../util/api";
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
} from "@mui/material";
import { calculateGravatar } from "../../../util/gravatar";
import { loc } from "../../../util/localization";

export function ConfirmDeleteDialog(props: {
    item: MinimalContentType;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [deleted, setDeleted] = useState<MinimalContentType[] | null>(null);
    useEffect(() => {
        get<MinimalContentType[]>(
            `/content/query_delete/${props.item.oid}`
        ).then((result) => {
            if (result.success) {
                setDeleted(result.value);
            }
        });
    }, [props.item]);

    function close() {
        props.setOpen(false);
    }

    return (
        <Dialog open={props.open} onClose={close}>
            <DialogTitle>
                {loc("content.universal.dialogs.delete.title", {
                    name: props.item.name,
                })}
            </DialogTitle>
            <DialogContent>
                <Box>
                    {loc("content.universal.dialogs.delete.description")}
                    <Paper
                        variant="outlined"
                        sx={{ padding: "8px", marginTop: "8px" }}
                    >
                        {deleted ? (
                            deleted.map((v) => (
                                <Chip
                                    key={v.oid}
                                    avatar={
                                        <Avatar
                                            src={
                                                v.image
                                                    ? `/api/user_content/${v.image}`
                                                    : calculateGravatar(
                                                          v.oid,
                                                          64
                                                      )
                                            }
                                            component="image"
                                            alt=""
                                        />
                                    }
                                    label={v.name}
                                />
                            ))
                        ) : (
                            <CircularProgress />
                        )}
                    </Paper>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={close}>
                    {loc("generic.cancel")}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        del(`/content/${props.item.oid}`);
                        close();
                    }}
                >
                    {loc("generic.confirm")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
