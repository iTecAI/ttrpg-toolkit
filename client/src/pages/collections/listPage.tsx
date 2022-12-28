import { Box } from "@mui/system";
import { useEffect, useReducer, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MinimalCollection } from "../../models/collection";
import { get } from "../../util/api";
import { useSnackbar } from "notistack";
import { loc } from "../../util/localization";
import {
    AppBar,
    Avatar,
    Chip,
    IconButton,
    Paper,
    SpeedDial,
    SpeedDialAction,
    Stack,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    MdAdd,
    MdArticle,
    MdCollectionsBookmark,
    MdOutlineArrowUpward,
    MdPerson,
    MdTag,
} from "react-icons/md";
import "./listPage.scss";
import { calculateGravatar } from "../../util/gravatar";
import { Masonry } from "@mui/lab";
import { useWindowSize } from "../../util/general";
import { CreateSubCollectionDialog } from "./item_types/subcollection/creation";

export function CollectionItemListPage() {
    const { itemId } = useParams();
    const [searchParams] = useSearchParams();
    const [collection, setCollection] = useState<MinimalCollection | null>(
        null
    );
    const { enqueueSnackbar } = useSnackbar();
    const nav = useNavigate();
    const { width } = useWindowSize();

    function reduceDialog(
        state: { [key: string]: boolean },
        action: { [key: string]: boolean }
    ): { [key: string]: boolean } {
        const newState = { ...state };
        for (let dialog of Object.keys(action)) {
            if (Object.keys(newState).includes(dialog)) {
                newState[dialog] = action[dialog];
            }
        }
        return newState;
    }

    const [dialogs, setDialog] = useReducer(reduceDialog, {
        createCollection: false,
    });

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
                    <Tooltip
                        title={loc("collections.contents.nav-up")}
                        placement="left"
                    >
                        <IconButton
                            className="up-button"
                            onClick={() => {
                                if (
                                    searchParams.get("from") &&
                                    searchParams.get("from") !== "root"
                                ) {
                                    nav(
                                        `/collections/${searchParams.get(
                                            "from"
                                        )}`
                                    );
                                } else {
                                    nav("/collections");
                                }
                            }}
                        >
                            <MdOutlineArrowUpward size={24} />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <SpeedDial
                className="new-item-btn"
                ariaLabel=""
                icon={<MdAdd size={24} />}
            >
                <SpeedDialAction
                    icon={<MdCollectionsBookmark size={20} />}
                    tooltipTitle={loc(
                        "collections.contents.new-item.collection"
                    )}
                    onClick={() => {
                        setDialog({ createCollection: true });
                    }}
                />
                <SpeedDialAction
                    icon={<MdArticle size={20} />}
                    tooltipTitle={loc("collections.contents.new-item.document")}
                />
                <SpeedDialAction
                    icon={<MdPerson size={20} />}
                    tooltipTitle={loc(
                        "collections.contents.new-item.character"
                    )}
                />
            </SpeedDial>
            <Masonry
                spacing={2}
                columns={Math.ceil((width ?? window.innerWidth) / 480)}
                className={"item-list"}
            >
                <></>
            </Masonry>
            <>
                <CreateSubCollectionDialog
                    open={dialogs.createCollection}
                    setOpen={(open) => setDialog({ createCollection: open })}
                    onCreate={() => {}}
                    parent={itemId ?? "root"}
                />
            </>
        </Box>
    ) : (
        <></>
    );
}
