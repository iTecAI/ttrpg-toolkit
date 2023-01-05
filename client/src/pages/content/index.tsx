import {
    AppBar,
    InputAdornment,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { Box } from "@mui/system";

import "./index.scss";
import { MdImage, MdSearch } from "react-icons/md";
import { createContext, useEffect, useReducer, useState } from "react";
import { loc } from "../../util/localization";
import { MinimalContentType, ContentDataType } from "../../models/content";
import { ConfirmDeleteDialog } from "./dialogs/confirmDeleteDialog";
import { ListView } from "./listview";
import { Rnd } from "react-rnd";
import { useWindowSize } from "../../util/general";
import { useParams } from "react-router";
import { DocumentTypeRenderer } from "./types/document";
import { isArray } from "../../libs/modular-renderer/types/guards";

function RenderContentPage(props: {
    type: ContentDataType;
    id: string;
}): JSX.Element {
    const RENDERER_MAP: {
        [key: string]: (props: { itemId: string }) => JSX.Element;
    } = {
        document: DocumentTypeRenderer,
    };

    const RendererElement = RENDERER_MAP[props.type];
    return <RendererElement itemId={props.id} />;
}

export const ItemsExpandedContext = createContext<string[]>([]);

export function ContentPage() {
    const [search, setSearch] = useState<string>("");
    const { height } = useWindowSize();
    const {
        type,
        id,
        "*": stub,
    } = useParams() as { type?: ContentDataType; id?: string; "*"?: string };

    const [expanded, setExpanded] = useReducer(
        (
            state: string[],
            action: { id: string; expanded: boolean } | string[]
        ) => {
            if (isArray(action)) {
                return action;
            } else {
                let newState: string[] = JSON.parse(JSON.stringify(state));
                if (action.expanded && !state.includes(action.id)) {
                    newState.push(action.id);
                } else if (!action.expanded && state.includes(action.id)) {
                    newState = newState.filter((v) => v !== action.id);
                }
                return newState;
            }
        },
        []
    );

    useEffect(() => {
        if (stub && stub.length > 0) {
            setExpanded(stub.split("/"));
        }
    }, [stub]);

    const [deleting, setDeleting] = useState<MinimalContentType | null>(null);
    const [vWidth, setVWidth] = useState<string>("320px");

    return (
        <Box className="content-page">
            <Rnd
                className="item-select-resize"
                disableDragging
                size={{ width: vWidth, height: height ?? 1920 }}
                onResize={(e, dir, ref, delta, position) => {
                    setVWidth(ref.style.width);
                }}
                maxWidth="50%"
                minWidth="320px"
            >
                <Paper variant="outlined" className="view-container">
                    <AppBar className="top-bar" elevation={1}>
                        <Box className="contents">
                            <TextField
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MdSearch size={24} />
                                        </InputAdornment>
                                    ),
                                }}
                                className={"search"}
                                label={loc("content.toolbar.search")}
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />
                        </Box>
                    </AppBar>
                    <Box className="view-area">
                        <ItemsExpandedContext.Provider value={expanded}>
                            <ListView
                                search={search}
                                delete={setDeleting}
                                dense={false}
                                parent="root"
                                setExpanded={(id, expanded) => {
                                    setExpanded({ id, expanded });
                                    console.log(id, expanded);
                                }}
                            />
                        </ItemsExpandedContext.Provider>
                    </Box>
                    {deleting && (
                        <ConfirmDeleteDialog
                            item={deleting}
                            open={deleting !== null}
                            setOpen={(open: boolean) => setDeleting(null)}
                        />
                    )}
                </Paper>
            </Rnd>
            <Box
                className="item-view"
                sx={{
                    width: `calc(100% - ${vWidth})`,
                    left: vWidth,
                }}
            >
                {type && id ? (
                    <RenderContentPage type={type} id={id} />
                ) : (
                    <Box className="no-content">
                        <MdImage className="icon" />
                        <Typography variant="overline" className="text">
                            {loc("content.no-content")}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
