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

export function GridView(props: { search: string }): JSX.Element {
    const { width } = useWindowSize();
    const [items, setItems] = useState<MinimalContentType[]>([]);
    const parent = useParams().current ?? "root";
    useUpdate((update) => {
        get<MinimalContentType[]>(`/content/${parent}`).then((result) => {
            if (
                result.success &&
                JSON.stringify(result.value) !== JSON.stringify(items)
            ) {
                setItems(result.value);
            }
        });
    }, `content.update.${parent}`);
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
            columns={Math.ceil((width ?? 1920) / 320)}
            className="grid-masonry"
        >
            {items.map((item) => {
                if (Object.keys(RENDERERS).includes(item.dataType)) {
                    if (
                        item.name.includes(props.search) ||
                        props.search.includes(item.name) ||
                        props.search.length === 0
                    ) {
                        const DynamicElement = RENDERERS[item.dataType];
                        return <DynamicElement item={item} key={item.oid} />;
                    }
                }
                return null;
            })}
            <CreateGridViewItem parent={parent} />
        </Masonry>
    );
}
