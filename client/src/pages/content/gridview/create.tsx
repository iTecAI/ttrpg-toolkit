import { IconButton, Paper, Tooltip, Typography } from "@mui/material";
import "./index.scss";
import { Box } from "@mui/system";
import {
    MdAdd,
    MdCreateNewFolder,
    MdDescription,
    MdMap,
    MdPersonAdd,
} from "react-icons/md";
import { loc } from "../../../util/localization";
import { ReactNode, useState } from "react";
import { Masonry } from "@mui/lab";
import { CreateFolderDialog } from "../types/folder/createDialog";
import { CreateDocumentDialog } from "../types/document/createDialog";

function CreateButton(props: {
    icon: ReactNode;
    tooltip: string;
    onClick: () => void;
}): JSX.Element {
    return (
        <Box className="btn-container">
            <Tooltip title={props.tooltip} disableInteractive>
                <IconButton
                    className="create-btn"
                    color="default"
                    size="large"
                    onClick={props.onClick}
                >
                    {props.icon}
                </IconButton>
            </Tooltip>
        </Box>
    );
}

export function CreateGridViewItem(props: { parent: string }): JSX.Element {
    const [creating, setCreating] = useState<"folder" | "document" | null>(
        null
    );
    return (
        <Paper variant="outlined" className="create-item">
            <Box className="addition-container">
                <Box className="add-icon">
                    <MdAdd size={32} className="icon" />
                    <Typography variant="overline" className="text">
                        {loc("content.create.new")}
                    </Typography>
                    <Paper elevation={1} className="add-buttons">
                        <Typography variant="overline" className="types-title">
                            {loc("content.create.types")}
                        </Typography>
                        <Masonry spacing={2} columns={3}>
                            <CreateButton
                                icon={<MdCreateNewFolder size={32} />}
                                tooltip={loc("content.create.folder")}
                                onClick={() => {
                                    setCreating("folder");
                                }}
                            />
                            <CreateButton
                                icon={<MdDescription size={32} />}
                                tooltip={loc("content.create.document")}
                                onClick={() => {
                                    setCreating("document");
                                }}
                            />
                            <CreateButton
                                icon={<MdPersonAdd size={32} />}
                                tooltip={loc("content.create.character")}
                                onClick={() => {}}
                            />
                            <CreateButton
                                icon={<MdMap size={32} />}
                                tooltip={loc("content.create.map")}
                                onClick={() => {}}
                            />
                        </Masonry>
                    </Paper>
                </Box>
            </Box>
            <CreateFolderDialog
                parent={props.parent}
                open={creating === "folder"}
                setOpen={(open: boolean) => setCreating(open ? "folder" : null)}
            />
            <CreateDocumentDialog
                parent={props.parent}
                open={creating === "document"}
                setOpen={(open: boolean) =>
                    setCreating(open ? "document" : null)
                }
            />
        </Paper>
    );
}
