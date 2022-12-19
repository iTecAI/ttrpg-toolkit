import { TextField } from "@mui/material";
import { RendererFunction } from ".";
import { FormData } from "../types";
import { RenderSimpleFieldItem } from "../types/renderTypes";
import * as React from "react";
import { useFormField } from "../utility/document_communication";

export const SimpleFieldItem: RendererFunction = (
    renderer: RenderSimpleFieldItem,
    _data: any,
    _formData: FormData
) => {
    const [value, setValue] = useFormField<string>(renderer.fieldId);
    return (
        <TextField
            className="render-item child simple-field"
            value={value ?? ""}
            onChange={(event) => setValue(event.target.value)}
        />
    );
};
