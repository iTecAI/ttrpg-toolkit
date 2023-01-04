import { Box } from "@mui/system";
import { MinimalContentType } from "../../../models/content";
import { RenderGeneric } from "./RenderGeneric";
import { MdFolder, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { Paper } from "@mui/material";
import "./folder.scss";
import { useState } from "react";
import { ListView } from ".";

export default function RenderFolder(props: {
    item: MinimalContentType;
    delete: (item: MinimalContentType) => void;
    dense: boolean;
    search: string;
}): JSX.Element {
    const [expanded, setExpanded] = useState<boolean>(false);

    return (
        <Box className="content-renderer folder">
            <Box className={`item${expanded ? " open" : ""}`}>
                <RenderGeneric
                    item={props.item}
                    badge={<MdFolder size={18} />}
                    delete={props.delete}
                />
                <Paper
                    className={`expand${expanded ? " open" : ""}`}
                    variant="outlined"
                    onClick={() => setExpanded(!expanded)}
                >
                    <MdOutlineKeyboardArrowDown size={24} />
                </Paper>
            </Box>
            {expanded && (
                <ListView
                    dense={props.dense}
                    search={props.search}
                    delete={props.delete}
                    parent={props.item.oid}
                />
            )}
        </Box>
    );
}
