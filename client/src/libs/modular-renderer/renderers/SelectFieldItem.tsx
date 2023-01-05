import { InputAdornment, MenuItem, TextField } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import {
    RenderSelectFieldItem,
    RenderSelectFieldOptionItem,
} from "../types/renderTypes";
import { useDisabled, useValueItem } from "../utility/hooks";
import { ModularAvatar } from "./common";
import { useFormField } from "../utility/document_communication";
import { isArray } from "../types/guards";
import { expandItems, parseFunction, parseValueItem } from "../utility/parsers";

export const SelectFieldItem: RendererFunction<RenderSelectFieldItem> = (
    props: RendererFunctionProps<RenderSelectFieldItem>
) => {
    const { renderer, data, formData } = props;
    const variant = renderer.variant ?? "outlined";
    const fullWidth = renderer.fullWidth ?? false;
    const iconDesc = renderer.icon ?? null;
    const placeholder = useValueItem(renderer.placeholder ?? "", data);
    const label = useValueItem(renderer.label ?? "", data);
    const optionsRaw = renderer.options ?? [];
    const options = expandItems(optionsRaw, data, formData);

    const icon = iconDesc && <ModularAvatar item={iconDesc.type} />;
    const iconPos = iconDesc && (iconDesc.position ?? "start");
    const disabled = useDisabled();

    const [val, setVal] = useFormField<any>(renderer.fieldId);

    return (
        <div className="render-item child select-field">
            <TextField
                disabled={disabled}
                placeholder={placeholder}
                label={renderer.label && label}
                variant={variant}
                id={renderer.fieldId}
                select
                value={
                    renderer.multiple
                        ? isArray(val)
                            ? val ?? []
                            : val
                            ? [val]
                            : []
                        : val ?? ""
                }
                onChange={(event) => {
                    setVal(event.target.value);
                }}
                fullWidth={fullWidth}
                InputProps={
                    iconDesc
                        ? {
                              startAdornment: (
                                  <InputAdornment position={iconPos ?? "start"}>
                                      {icon}
                                  </InputAdornment>
                              ),
                          }
                        : undefined
                }
                SelectProps={{
                    multiple: renderer.multiple ?? false,
                }}
            >
                {options.map((o) => {
                    const ren: RenderSelectFieldOptionItem = o.renderer as any;
                    const oid = parseValueItem(
                        ren.optionId ?? "",
                        o.data,
                        formData
                    ).result;
                    const oname = parseValueItem(
                        ren.displayName ?? "",
                        o.data,
                        formData
                    ).result;
                    if (ren.conditionalRender) {
                        const result = parseFunction(
                            ren.conditionalRender,
                            o.data,
                            formData
                        );
                        if (!result) {
                            return <></>;
                        }
                    }
                    return (
                        <MenuItem value={oid} key={oid}>
                            {oname}
                        </MenuItem>
                    );
                })}
            </TextField>
        </div>
    );
};
