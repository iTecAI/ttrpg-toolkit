import { RendererFunction, RendererFunctionProps } from "..";
import { RenderTextEditor } from "../../types/renderTypes";
import * as React from "react";
import { useFormField } from "../../utility/document_communication";
import { Box } from "@mui/system";

export const TextEditorItem: RendererFunction<RenderTextEditor> = (
    props: RendererFunctionProps<RenderTextEditor>
) => {
    const { renderer } = props;

    return <Box className="render-item text-editor child"></Box>;
};
