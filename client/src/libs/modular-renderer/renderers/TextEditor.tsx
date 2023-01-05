import { RendererFunction, RendererFunctionProps } from ".";
import { RenderTextEditor } from "../types/renderTypes";
import * as React from "react";
import { useFormField } from "../utility/document_communication";
import { Box, SxProps } from "@mui/system";
import { Icon } from "./common";
import { useValueItem } from "../utility/hooks";
import { Typography } from "@mui/material";
import RichTextEditor from "../../../util/text-editor/RichTextEditor";

const style: SxProps = {
    ".title": {
        marginBottom: "8px",
        ".title-icon": {
            color: "white",
        },
        ".title-text": {
            display: "inline-block",
            color: "white",
            paddingLeft: "8px",
            verticalAlign: "bottom",
        },
    },
};

export const TextEditorItem: RendererFunction<RenderTextEditor> = (
    props: RendererFunctionProps<RenderTextEditor>
) => {
    const { renderer } = props;
    const [value, setValue] = useFormField<string>(renderer.fieldId);
    const title = useValueItem(renderer.title ?? "");

    return (
        <Box className="render-item text-editor child" sx={style}>
            {renderer.title || renderer.icon ? (
                <Box className="title">
                    {renderer.icon && (
                        <Icon
                            icon={renderer.icon}
                            data={props.data}
                            formData={props.formData}
                            iconProps={{ className: "title-icon", size: 24 }}
                        />
                    )}
                    {renderer.title && (
                        <Typography className="title-text" variant="h5">
                            {title}
                        </Typography>
                    )}
                </Box>
            ) : null}
            <RichTextEditor
                height="512px"
                value={value ?? ""}
                onChange={setValue}
            />
        </Box>
    );
};
