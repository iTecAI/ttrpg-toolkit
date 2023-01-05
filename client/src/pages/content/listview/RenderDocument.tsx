import { Box } from "@mui/system";
import { RenderGeneric, matchSearch } from "./RenderGeneric";
import { MdDescription } from "react-icons/md";
import { useNavigate } from "react-router";
import { ContentItemRenderProps } from ".";

export default function RenderDocument(
    props: ContentItemRenderProps
): JSX.Element {
    const nav = useNavigate();
    return matchSearch(props.item.name, props.search) ? (
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
    ) : (
        <></>
    );
}
