import { Masonry } from "@mui/lab";
import { useWindowSize } from "../../../util/general";
import "./index.scss";
import { CreateGridViewItem } from "./create";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MinimalContentType } from "../../../models/content";
import { get } from "../../../util/api";
import { RENDERERS } from "./renderers";
import { useUpdate } from "../../../util/updates";

export function GridView(props: {
    search: string;
    delete: (item: MinimalContentType) => void;
}): JSX.Element {
    const { width } = useWindowSize();
    const [items, setItems] = useState<MinimalContentType[]>([]);
    const parent = useParams().current ?? "root";

    const [updateName, setUpdateName] = useState<string>("none");

    useEffect(() => setUpdateName(`content.update.${parent}`), [parent]);

    useUpdate((update) => {
        get<MinimalContentType[]>(`/content/${parent}`).then((result) => {
            if (
                result.success &&
                JSON.stringify(result.value) !== JSON.stringify(items)
            ) {
                setItems(result.value);
            }
        });
    }, updateName);
    useEffect(() => {
        get<MinimalContentType[]>(`/content/${parent}`).then((result) => {
            if (result.success) {
                setItems(result.value);
            }
        });
    }, [parent]);

    return (
        <Masonry
            spacing={2}
            columns={Math.ceil((width ?? 1920) / 420)}
            className="grid-masonry"
        >
            {items.map((item) => {
                if (Object.keys(RENDERERS).includes(item.dataType)) {
                    if (
                        item.name
                            .toLowerCase()
                            .includes(props.search.toLowerCase()) ||
                        props.search
                            .toLowerCase()
                            .includes(item.name.toLowerCase()) ||
                        props.search.length === 0
                    ) {
                        const DynamicElement = RENDERERS[item.dataType];
                        return (
                            <DynamicElement
                                item={item}
                                key={item.oid}
                                onDelete={props.delete}
                            />
                        );
                    }
                }
                return null;
            })}
            <CreateGridViewItem parent={parent} />
        </Masonry>
    );
}
