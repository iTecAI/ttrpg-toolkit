import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./overrides.scss";

const modules = {
    toolbar: [
        [
            { header: [1, 2, 3, 4, false] },
            { size: ["small", false, "large", "huge"] },
            { font: [] },
        ],
        ["bold", "italic", "underline", "strike", "code"],
        ["blockquote", "code-block"],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
        ],
        ["link", "image"],
        ["clean"],
    ],
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
        <ReactQuill
            theme="snow"
            value={props.value}
            onChange={props.onChange}
            style={{
                height: props.height,
            }}
            modules={modules}
            formats={formats}
            className={`rich-editor${props.disabled ? " disabled" : ""}`}
        />
    );
}
