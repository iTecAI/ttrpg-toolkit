import {
    Avatar,
    Badge,
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    CardMedia,
    Chip,
    CircularProgress,
    Paper,
    SpeedDial,
    SpeedDialAction,
    Tooltip,
} from "@mui/material";
import {
    MdCollectionsBookmark,
    MdDelete,
    MdMenu,
    MdPersonAdd,
    MdRemoveCircle,
    MdSettings,
} from "react-icons/md";
import "./render.scss";
import { loc } from "../../../../util/localization";
import { useContext, useEffect, useState } from "react";
import { del, get } from "../../../../util/api";
import {
    CollectionItemLocator,
    MinimalCollection,
} from "../../../../models/collection";
import { Md5 } from "ts-md5";
import { useDialog } from "../../../../util/DialogContext";
import { ShareCollectionDialog } from "../../dialogs/ShareDialog";
import { ConfigureDialog } from "../../dialogs/ConfigureDialog";
import { useNavigate } from "react-router-dom";

function QueryResult(props: {
    item: MinimalCollection;
    query: "delete" | "remove";
    parent?: MinimalCollection;
}) {
    const [query, setQuery] = useState<string[] | null>(null);
    useEffect(() => {
        get<string[]>(
            `/collections/${props.item.collectionId}/query_result/${props.query}`,
            {
                urlParams:
                    props.query === "remove" && props.parent
                        ? { extra: props.parent.collectionId ?? "" }
                        : undefined,
            }
        ).then((result) => {
            if (result.success) {
                setQuery(result.value);
            }
        });
    }, [props.item]);

    return (
        <Paper sx={{ padding: "4px", marginTop: "8px" }} elevation={0}>
            {query ? (
                query.map((v) => (
                    <Chip key={v} label={v} sx={{ margin: "4px" }} />
                ))
            ) : (
                <CircularProgress />
            )}
        </Paper>
    );
}

export function SubCollectionItem(props: {
    item: MinimalCollection;
    parent: MinimalCollection | "root";
}): JSX.Element {
    const { item } = props;

    const confirmDialog = useDialog({
        title: loc("collections.list.item.delete.title", { name: item.name }),
        content: (
            <>
                {loc("collections.list.item.delete.body", { name: item.name })}
                <QueryResult item={item} query={"delete"} />
            </>
        ),
        buttons: [
            {
                text: loc("generic.cancel"),
                variant: "outlined",
                id: "cancel",
            },
            {
                text: loc("generic.confirm"),
                variant: "contained",
                id: "confirm",
                action(id, initializer) {
                    del<null>(`/collections/${initializer.id}`);
                },
            },
        ],
    });

    const confirmRemoveDialog = useDialog({
        title: loc("collections.list.item.remove.title", {
            name: item.name,
            collection: (props.parent as MinimalCollection).name,
        }),
        content: (
            <>
                {loc("collections.list.item.remove.body", {
                    name: item.name,
                    collection: (props.parent as MinimalCollection).name,
                })}
                <QueryResult
                    item={item}
                    query={"delete"}
                    parent={props.parent as MinimalCollection}
                />
            </>
        ),
        buttons: [
            {
                text: loc("generic.cancel"),
                variant: "outlined",
                id: "cancel",
            },
            {
                text: loc("generic.confirm"),
                variant: "contained",
                id: "confirm",
                action(id, initializer) {
                    del<null>(
                        `/collections/${initializer.parent}/child/${initializer.id}`
                    );
                },
            },
        ],
    });

    const [sharing, setSharing] = useState<boolean>(false);
    const [configuring, setConfiguring] = useState<boolean>(false);
    const nav = useNavigate();

    return (
        <Card className="collection">
            <Box className="bk-icon">
                <Badge
                    badgeContent={Object.keys(item.children).length}
                    className="child-count"
                    max={99}
                    color={"primary"}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    <Tooltip
                        title={loc("collections.contents.new-item.collection")}
                        disableInteractive
                    >
                        <Avatar className="avatar">
                            <MdCollectionsBookmark size={24} />
                        </Avatar>
                    </Tooltip>
                </Badge>
            </Box>
            {(item.permissions.includes("configure") ||
                item.permissions.includes("share") ||
                item.permissions.includes("admin")) && (
                <SpeedDial
                    className="collection-actions"
                    icon={<MdMenu size={24} />}
                    ariaLabel=""
                    direction="down"
                    FabProps={{
                        color: "info",
                        size: "medium",
                    }}
                >
                    {item.permissions.includes("configure") && (
                        <SpeedDialAction
                            icon={<MdSettings size={24} />}
                            tooltipTitle={loc(
                                "collections.list.item.actions.settings"
                            )}
                            onClick={() => setConfiguring(true)}
                        />
                    )}
                    {item.permissions.includes("share") && (
                        <SpeedDialAction
                            icon={<MdPersonAdd size={24} />}
                            tooltipTitle={loc(
                                "collections.list.item.actions.share"
                            )}
                            onClick={() => setSharing(true)}
                        />
                    )}
                    {item.parents.length > 1
                        ? props.parent !== "root" &&
                          props.parent.permissions.includes("delete")
                        : props.parent !== "root" &&
                          props.parent.permissions.includes("admin") && (
                              <SpeedDialAction
                                  icon={
                                      <MdRemoveCircle
                                          size={24}
                                          color={"#f57b36"}
                                      />
                                  }
                                  tooltipTitle={loc(
                                      "collections.list.item.actions.remove"
                                  )}
                                  onClick={() => {
                                      confirmRemoveDialog({
                                          id: item.collectionId,
                                          parent: (
                                              props.parent as MinimalCollection
                                          ).collectionId,
                                      });
                                  }}
                              />
                          )}
                    {item.permissions.includes("admin") && (
                        <SpeedDialAction
                            icon={<MdDelete size={24} color={"#f44336"} />}
                            tooltipTitle={loc(
                                "collections.list.item.actions.delete"
                            )}
                            onClick={() =>
                                confirmDialog({ id: item.collectionId })
                            }
                        />
                    )}
                </SpeedDial>
            )}
            <CardActionArea
                onClick={() => nav(`/collections/${item.collectionId}`)}
            >
                <CardHeader
                    title={item.name}
                    sx={{
                        paddingLeft: item.permissions.includes("owner")
                            ? "48px"
                            : "16px",
                    }}
                />
                {item.image ? (
                    <CardMedia
                        component="img"
                        image={item.image}
                        alt={loc("collections.list.item.media-alt", {
                            name: item.name,
                        })}
                        height={320}
                    />
                ) : (
                    <CardMedia
                        component="img"
                        image={`https://www.gravatar.com/avatar/${Md5.hashStr(
                            item.collectionId
                        )}?d=identicon&f=y&s=1024`}
                        alt={loc("collections.list.item.media-alt", {
                            name: item.name,
                        })}
                        height={320}
                        sx={{
                            filter: "grayscale(1)",
                            opacity: 0.5,
                        }}
                    />
                )}
                <CardContent>
                    {item.description &&
                        item.description
                            .split("\n")
                            .map((line) => <p key={Math.random()}>{line}</p>)}
                    <Paper variant="outlined" className="tag-area">
                        {item.tags.length
                            ? item.tags.map((t) => <Chip label={t} key={t} />)
                            : loc("collections.list.item.tags-empty")}
                    </Paper>
                </CardContent>
            </CardActionArea>
            <ShareCollectionDialog
                collection={item}
                open={sharing}
                setOpen={setSharing}
            />
            <ConfigureDialog
                collection={item}
                open={configuring}
                setOpen={setConfiguring}
            />
        </Card>
    );
}