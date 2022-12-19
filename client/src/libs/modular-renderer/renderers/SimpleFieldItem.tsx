import { TextField, Typography } from "@mui/material";
import { RendererFunction } from ".";
import { FormData } from "../types";
import { RenderSimpleFieldItem } from "../types/renderTypes";
import * as React from "react";
import {
    useSubscribe,
    useUpdateField,
} from "../utility/document_communication";
import { useState } from "react";

export const SimpleFieldItem: RendererFunction = (
    renderer: RenderSimpleFieldItem,
    _data: any,
    _formData: FormData
) => {
    const fieldId = renderer.fieldId ?? null;
    let sub = useSubscribe(fieldId ? [fieldId] : []);
    const [value, setValue] = useState<string | undefined>(
        fieldId && sub[fieldId]
    );
    useUpdateField(fieldId ?? undefined, value);
    return (
        <TextField
            className="render-item child simple-field"
            value={value}
            onChange={(event) => setValue(event.target.value)}
        />
    );
};
