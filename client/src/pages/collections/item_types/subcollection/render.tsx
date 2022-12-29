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
    MdSettings,
} from "react-icons/md";
import "./render.scss";
import { loc } from "../../../../util/localization";
import { useState } from "react";
import { del } from "../../../../util/api";
import { MinimalCollection } from "../../../../models/collection";
import { Md5 } from "ts-md5";
import { useDialog } from "../../../../util/DialogContext";
import { ShareCollectionDialog } from "../../dialogs/ShareDialog";
import { ConfigureDialog } from "../../dialogs/ConfigureDialog";
import { useNavigate } from "react-router-dom";

export function SubCollectionItem(props: {
    item: MinimalCollection;
    parent: MinimalCollection | "root";
}): JSX.Element {
    const { item } = props;
    const confirmDialog = useDialog({
        title: loc("collections.list.item.delete.title", { name: item.name }),
        content: loc("collections.list.item.delete.body", { name: item.name }),
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
