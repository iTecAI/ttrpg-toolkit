import { Box } from "@mui/system";
import { MinimalContentType } from "../../../models/content";
import { RenderGeneric } from "./RenderGeneric";
import { MdDescription } from "react-icons/md";
import { useNavigate } from "react-router";

export default function RenderDocument(props: {
    item: MinimalContentType;
    delete: (item: MinimalContentType) => void;
    dense: boolean;
    search: string;
}): JSX.Element {
    const nav = useNavigate();
    return (
        <Box
            sx={{ cursor: "pointer" }}
            className="content-renderer document"
            onClick={() => nav(`/content/document/${props.item.oid}`)}
        >
            <RenderGeneric
                item={props.item}
                badge={<MdDescription size={18} />}
                delete={props.delete}
            />
        </Box>
    );
}
