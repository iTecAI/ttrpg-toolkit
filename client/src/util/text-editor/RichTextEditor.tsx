import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./overrides.scss";
import { Box } from "@mui/system";
import { MuiRichTextToolbar } from "./MuiToolbar";

const modules = {
    toolbar: {
        container: "#mui-editor",
    },
};

const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "code",
    "code-block",
];

export default function RichTextEditor(props: {
    height?: string;
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
}): JSX.Element {
    return (
        <Box
            className={`rich-editor-container${
                props.disabled ? " disabled" : ""
            }`}
        >
            <MuiRichTextToolbar id={"mui-editor"} />
            <ReactQuill
                theme="snow"
                value={props.value}
                onChange={props.onChange}
                style={{
                    height: props.height
                        ? `calc(props.height - 40px)`
                        : undefined,
                }}
                modules={modules}
                formats={formats}
                className={`rich-editor${props.disabled ? " disabled" : ""}`}
            />
        </Box>
    );
}
