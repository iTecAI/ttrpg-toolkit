import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MinimalCollection } from "../../models/collection";
import { get } from "../../util/api";
import { useSnackbar } from "notistack";
import { loc } from "../../util/localization";
import {
    AppBar,
    Avatar,
    Chip,
    Paper,
    Stack,
    Toolbar,
    Typography,
} from "@mui/material";
import { MdCollectionsBookmark, MdTag } from "react-icons/md";
import "./listPage.scss";
import { calculateGravatar } from "../../util/gravatar";

export function CollectionItemListPage() {
    const { type, itemId } = useParams();
    const [collection, setCollection] = useState<MinimalCollection | null>(
        null
    );
    const { enqueueSnackbar } = useSnackbar();
    const nav = useNavigate();

    useEffect(() => {
        get<MinimalCollection>(`/collections/${itemId}`).then((result) => {
            if (result.success) {
                setCollection(result.value);
            } else {
                enqueueSnackbar(loc("error.collections.not_found"), {
                    variant: "error",
                });
                nav("/collections");
            }
        });
    }, []);

    return collection ? (
        <Box className="collection-item-list-page">
            <AppBar className="collection-summary" elevation={0}>
                <Toolbar className="toolbar">
                    <Avatar
                        src={
                            collection.image
                                ? collection.image
                                : calculateGravatar(collection.collectionId)
                        }
                        className="collection-image"
                    />
                    <Typography variant={"h5"} className="collection-name">
                        {collection.name}
                    </Typography>
                    <Paper variant="outlined" className="tags">
                        <Stack spacing={0.5} direction={"row"}>
                            <MdTag size={16} className="tag-icon" />
                            {collection.tags.length
                                ? collection.tags.map((v) => (
                                      <Chip label={v} size="small" />
                                  ))
                                : loc("collections.list.item.tags-empty")}
                        </Stack>
                    </Paper>
                </Toolbar>
            </AppBar>
        </Box>
    ) : (
        <></>
    );
}
