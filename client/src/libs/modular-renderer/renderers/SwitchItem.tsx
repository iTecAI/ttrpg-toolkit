import { Switch, Checkbox, FormControlLabel } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import { RenderSwitchItem } from "../types/renderTypes";
import * as React from "react";
import { useFormField } from "../utility/document_communication";
import { useDisabled, useValueItem } from "../utility/hooks";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";

export const SwitchItem: RendererFunction<RenderSwitchItem> = (
    props: RendererFunctionProps<RenderSwitchItem>
) => {
    const { renderer, data } = props;
    const [value, setValue] = useFormField<boolean>(renderer.fieldId);
    const label = useValueItem(renderer.label ?? "", data);
    const disabled = useDisabled();
    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setValue(event.target.checked);
    }
    switch (renderer.variant ?? "switch") {
        case "checkbox":
            return (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={Boolean(value)}
                            onChange={handleChange}
                        />
                    }
                    label={label}
                    disabled={disabled}
                />
            );
        case "radio":
            return (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={Boolean(value)}
                            onChange={handleChange}
                            checkedIcon={<MdRadioButtonChecked size={20} />}
                            icon={<MdRadioButtonUnchecked size={20} />}
                        />
                    }
                    label={label}
                    disabled={disabled}
                />
            );
        case "switch":
            return (
                <FormControlLabel
                    control={
                        <Switch
                            checked={Boolean(value)}
                            onChange={handleChange}
                        />
                    }
                    label={label}
                    disabled={disabled}
                />
            );
    }
};
