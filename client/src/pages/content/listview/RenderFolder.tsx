import { Box } from "@mui/system";
import { RenderGeneric } from "./RenderGeneric";
import { MdFolder, MdOutlineKeyboardArrowDown } from "react-icons/md";
import { Paper } from "@mui/material";
import "./folder.scss";
import { ContentItemRenderProps, ListView } from ".";
import { useContext, useEffect, useState } from "react";
import { ItemsExpandedContext } from "..";
import { useNavigate } from "react-router";
import { get } from "../../../util/api";

function useExpanded(props: ContentItemRenderProps): [boolean, string[]] {
    const expandedContext = useContext(ItemsExpandedContext);
    const [expanded, setExpanded] = useState<boolean>(
        expandedContext.includes(props.item.oid)
    );
    useEffect(() => {
        setExpanded(expandedContext.includes(props.item.oid));
    }, [props, expandedContext]);
    return [expanded, expandedContext];
}

export default function RenderFolder(
    props: ContentItemRenderProps
): JSX.Element {
    const [expanded] = useExpanded(props);
    const nav = useNavigate();
    return (
        <Box className="content-renderer folder">
            <Box className={`item${expanded ? " open" : ""}`}>
                <Box
                    onClick={(event) => {
                        event.stopPropagation();
                        get<string[]>(
                            `/content/${props.item.oid}/parents`
                        ).then((result) => {
                            if (result.success) {
                                nav(
                                    `/content/folder/${result.value.join("/")}`
                                );
                            }
                        });
                    }}
                >
                    <RenderGeneric
                        item={props.item}
                        badge={<MdFolder size={18} />}
                        delete={props.delete}
                    />
                </Box>
                <Paper
                    className={`expand${expanded ? " open" : ""}`}
                    variant="outlined"
                    onClick={() => props.setExpanded(props.item.oid, !expanded)}
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
                    setExpanded={props.setExpanded}
                />
            )}
        </Box>
    );
}
