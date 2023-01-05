import { Box, Fab, Paper, Stack, Tooltip } from "@mui/material";
import {
    ExpandedContentType,
    MinimalContentType,
} from "../../../models/content";
import { useUpdate } from "../../../util/updates";
import { get } from "../../../util/api";
import { useEffect, useMemo, useState } from "react";
import RenderFolder from "./RenderFolder";
import "./view.scss";
import {
    MdAdd,
    MdDescription,
    MdFolder,
    MdMap,
    MdPerson,
} from "react-icons/md";
import { loc } from "../../../util/localization";
import { useHorizontalScroll } from "../../../util/hscroll";
import { CreateFolderDialog } from "../types/folder/createDialog";
import { CreateDocumentDialog } from "../types/document/createDialog";
import RenderDocument from "./RenderDocument";

export type ContentItemRenderProps = {
    item: MinimalContentType;
    delete: (item: MinimalContentType) => void;
    dense: boolean;
    search: string;
    setExpanded: (id: string, expanded: boolean) => void;
};

const RENDER_MAP: {
    [key: string]: (props: ContentItemRenderProps) => JSX.Element;
} = {
    folder: RenderFolder,
    document: RenderDocument,
};

function CreateBtn(props: {
    icon: JSX.Element;
    type: string;
    onClick: (type: string) => void;
}): JSX.Element {
    return (
        <Tooltip
            placement="bottom"
            title={loc(`content.create.${props.type}`)}
            onClick={() => props.onClick(props.type)}
        >
            <Fab className="create-btn" color="info">
                {props.icon}
            </Fab>
        </Tooltip>
    );
}

export function ListView(props: {
    search: string;
    delete: (item: MinimalContentType) => void;
    dense: boolean;
    parent: string;
    setExpanded: (id: string, expanded: boolean) => void;
}): JSX.Element {
    const [updateName, setUpdateName] = useState<string>("");
    const [items, setItems] = useState<MinimalContentType[]>([]);
    const [parent, setParent] = useState<"root" | ExpandedContentType<any>>(
        "root"
    );
    const [creating, setCreating] = useState<string>("");

    useEffect(() => {
        if (props.parent === "root") {
            setParent("root");
        } else {
            get<ExpandedContentType<any>>(
                `/content/specific/${props.parent}`
            ).then((result) => {
                if (result.success) {
                    setParent(result.value);
                }
            });
        }
    }, [props.parent]);

    useMemo(() => {
        setUpdateName(`content.update.${props.parent}`);
    }, [props.parent]);

    useUpdate((update) => {
        get<MinimalContentType[]>(`/content/${props.parent}`).then((result) => {
            if (
                result.success &&
                JSON.stringify(result.value) !== JSON.stringify(items)
            ) {
                setItems(result.value);
            }
        });
    }, updateName);

    useEffect(() => {
        get<MinimalContentType[]>(`/content/${props.parent}`).then((result) => {
            if (result.success) {
                setItems(result.value);
            }
        });
    }, [props.parent]);

    const createRef = useHorizontalScroll(0.25);

    return (
        <Stack className="view-root list" spacing={1}>
            {items.map((v) => {
                if (Object.keys(RENDER_MAP).includes(v.dataType)) {
                    const DynamicRenderer = RENDER_MAP[v.dataType];
                    return (
                        <DynamicRenderer
                            key={v.oid}
                            item={v}
                            delete={props.delete}
                            search={props.search}
                            dense={props.dense}
                            setExpanded={props.setExpanded}
                        />
                    );
                }
                return null;
            })}
            {parent === "root" || parent.shared.edit ? (
                <Paper className="create" elevation={1}>
                    <Box className="icon">
                        <MdAdd size={32} />
                    </Box>
                    <Stack
                        className="buttons"
                        direction="row"
                        spacing={1}
                        ref={createRef}
                    >
                        <CreateBtn
                            icon={<MdFolder size={24} />}
                            type={"folder"}
                            onClick={setCreating}
                        />
                        <CreateBtn
                            icon={<MdDescription size={24} />}
                            type={"document"}
                            onClick={setCreating}
                        />
                        <CreateBtn
                            icon={<MdPerson size={24} />}
                            type={"character"}
                            onClick={setCreating}
                        />
                        <CreateBtn
                            icon={<MdMap size={24} />}
                            type={"map"}
                            onClick={setCreating}
                        />
                    </Stack>
                </Paper>
            ) : null}
            <CreateFolderDialog
                parent={props.parent}
                open={creating === "folder"}
                setOpen={(open) => setCreating(open ? "creating" : "")}
            />
            <CreateDocumentDialog
                parent={props.parent}
                open={creating === "document"}
                setOpen={(open) => setCreating(open ? "creating" : "")}
            />
        </Stack>
    );
}
