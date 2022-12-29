import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardActionArea,
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
    SpeedDial,
    SpeedDialAction,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdAdd,
    MdDelete,
    MdDescription,
    MdDriveFileRenameOutline,
    MdHideImage,
    MdImage,
    MdMenu,
    MdPersonAdd,
    MdSettings,
    MdStar,
    MdTag,
} from "react-icons/md";
import "./index.scss";
import { loc } from "../../util/localization";
import { useEffect, useState } from "react";
import { del, get, post, postFile } from "../../util/api";
import { useSnackbar } from "notistack";
import { MinimalCollection } from "../../models/collection";
import { UpdateType, useUpdate } from "../../util/updates";
import { Masonry } from "@mui/lab";
import { Md5 } from "ts-md5";
import { useWindowSize } from "../../util/general";
import { useDialog } from "../../util/DialogContext";
import { ShareCollectionDialog } from "./dialogs/ShareDialog";
import { ConfigureDialog } from "./dialogs/ConfigureDialog";
import { useNavigate } from "react-router-dom";
import { SubCollectionItem } from "./item_types/subcollection/render";
import { CreateSubCollectionDialog } from "./item_types/subcollection/creation";

export function Collections(): JSX.Element {
    const [creating, setCreating] = useState<boolean>(false);
    const [collections, setCollections] = useState<MinimalCollection[]>([]);
    const { width } = useWindowSize();
    useUpdate(
        (update: UpdateType) =>
            get<MinimalCollection[]>("/collections/", {
                urlParams: { parent: "root" },
            }).then((result) => {
                if (result.success) {
                    setCollections(result.value);
                }
            }),
        "collections.update"
    );

    useEffect(() => {
        get<MinimalCollection[]>("/collections/", {
            urlParams: { parent: "root" },
        }).then((result) => {
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
            <CreateSubCollectionDialog
                open={creating}
                setOpen={(open: boolean) => setCreating(open)}
                onCreate={() =>
                    get<MinimalCollection[]>("/collections/").then((result) => {
                        if (result.success) {
                            setCollections(result.value);
                        }
                    })
                }
                parent="root"
            />
            <Masonry
                spacing={2}
                columns={Math.ceil((width ?? window.innerWidth) / 480)}
                className={"collections-list"}
            >
                {collections.map((c) => (
                    <SubCollectionItem
                        item={c}
                        key={c.collectionId}
                        parent={"root"}
                    />
                ))}
            </Masonry>
        </Box>
    );
}
