import { TextField } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import { FormData } from "../types";
import { RenderSimpleFieldItem } from "../types/renderTypes";
import * as React from "react";
import { useFormField } from "../utility/document_communication";

export const SimpleFieldItem: RendererFunction<RenderSimpleFieldItem> = (
    props: RendererFunctionProps<RenderSimpleFieldItem>
) => {
    const { renderer, data, formData } = props;
    const [value, setValue] = useFormField<string>(renderer.fieldId);
    return (
        <TextField
            className="render-item child simple-field"
            value={value ?? ""}
            onChange={(event) => setValue(event.target.value)}
        />
    );
};
