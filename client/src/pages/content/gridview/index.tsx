import { Masonry } from "@mui/lab";
import { useWindowSize } from "../../../util/general";
import "./index.scss";
import { CreateGridViewItem } from "./create";

export function GridView(props: { search: string }): JSX.Element {
    const { width } = useWindowSize();

    return (
        <Masonry
            spacing={2}
            columns={Math.ceil((width ?? 1920) / 320)}
            className="grid-masonry"
        >
            <></>
            <CreateGridViewItem />
        </Masonry>
    );
}
