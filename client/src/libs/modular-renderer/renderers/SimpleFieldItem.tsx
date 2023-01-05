import { TextField } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import { RenderSimpleFieldItem } from "../types/renderTypes";
import * as React from "react";
import { useFormField } from "../utility/document_communication";
import { useDisabled } from "../utility/hooks";

export const SimpleFieldItem: RendererFunction<RenderSimpleFieldItem> = (
    props: RendererFunctionProps<RenderSimpleFieldItem>
) => {
    const { renderer } = props;
    const [value, setValue] = useFormField<string>(renderer.fieldId);
    const disabled = useDisabled();
    return (
        <TextField
            className="render-item child simple-field"
            value={value ?? ""}
            onChange={(event) => setValue(event.target.value)}
            disabled={disabled}
        />
    );
};
