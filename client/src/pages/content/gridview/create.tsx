import { IconButton, Paper, Tooltip, Typography } from "@mui/material";
import "./index.scss";
import { Box } from "@mui/system";
import { MdAdd, MdCreateNewFolder, MdFolder } from "react-icons/md";
import { loc } from "../../../util/localization";
import { ReactNode } from "react";
import { Masonry } from "@mui/lab";

function CreateButton(props: {
    icon: ReactNode;
    tooltip: string;
}): JSX.Element {
    return (
        <Box className="btn-container">
            <Tooltip title={props.tooltip} disableInteractive>
                <IconButton className="create-btn" color="primary" size="large">
                    {props.icon}
                </IconButton>
            </Tooltip>
        </Box>
    );
}

export function CreateGridViewItem(props: {}): JSX.Element {
    return (
        <Paper variant="outlined" className="create-item">
            <Box className="addition-container">
                <Box className="add-icon">
                    <MdAdd size={32} className="icon" />
                    <Typography variant="overline" className="text">
                        {loc("content.create.new")}
                    </Typography>
                    <Paper elevation={2} className="add-buttons">
                        <Masonry spacing={2} columns={3}>
                            <CreateButton
                                icon={<MdCreateNewFolder size={32} />}
                                tooltip={loc("content.create.folder")}
                            />
                        </Masonry>
                    </Paper>
                </Box>
            </Box>
        </Paper>
    );
}
