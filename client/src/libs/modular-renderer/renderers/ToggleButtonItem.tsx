import { ToggleButton } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import { RenderToggleButtonItem } from "../types/renderTypes";
import * as React from "react";
import { useFormField } from "../utility/document_communication";
import { useDisabled, useValueItem } from "../utility/hooks";
import { Icon } from "./common";

export const ToggleButtonItem: RendererFunction<RenderToggleButtonItem> = (
    props: RendererFunctionProps<RenderToggleButtonItem>
) => {
    const { renderer, data } = props;
    const [value, setValue] = useFormField<boolean>(renderer.fieldId);
    const label = useValueItem(renderer.label ?? "", data);
    const icon = renderer.icon ? (
        <Icon
            icon={renderer.icon}
            data={data}
            iconProps={{ size: 18, style: { paddingRight: "8px" } }}
        />
    ) : (
        <></>
    );
    const disabled = useDisabled();
    return (
        <ToggleButton
            disabled={disabled}
            color={Boolean(value) ? "primary" : undefined}
            onClick={(event) => setValue(!Boolean(value))}
            selected={Boolean(value)}
            value={renderer.fieldId ?? "unnamed"}
        >
            {icon}
            {label}
        </ToggleButton>
    );
};
