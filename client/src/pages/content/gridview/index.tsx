import { Masonry } from "@mui/lab";
import { useWindowSize } from "../../../util/general";
import "./index.scss";
import { CreateGridViewItem } from "./create";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MinimalContentType } from "../../../models/content";
import { get } from "../../../util/api";
import { RENDERERS } from "./renderers";

export function GridView(props: { search: string }): JSX.Element {
    const { width } = useWindowSize();
    const [items, setItems] = useState<MinimalContentType[]>([]);
    const parent = useParams().current ?? "root";
    useEffect(() => {
        get<MinimalContentType[]>(`/content/${parent}`).then((result) => {
            console.log(result);
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
                if (Object.keys(RENDERERS).includes(item.contentType)) {
                    const DynamicElement = RENDERERS[item.contentType];
                    return <DynamicElement item={item} key={item.oid} />;
                }
                return null;
            })}
            <CreateGridViewItem parent={parent} />
        </Masonry>
    );
}
