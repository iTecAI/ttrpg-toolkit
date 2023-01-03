import { InputAdornment, TextField } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import { RenderTextFieldItem } from "../types/renderTypes";
import { useValueItem } from "../utility/hooks";
import { ModularAvatar } from "./common";
import { useFormField } from "../utility/document_communication";
import { useState } from "react";
import { loc } from "../../../util/localization";
import { parseFunction } from "../utility/parsers";

export const TextFieldItem: RendererFunction<RenderTextFieldItem> = (
    props: RendererFunctionProps<RenderTextFieldItem>
) => {
    const { renderer, data, formData } = props;
    const variant = renderer.variant ?? "outlined";
    const fullWidth = renderer.fullWidth ?? false;
    const iconDesc = renderer.icon ?? null;
    const placeholder = useValueItem(renderer.placeholder ?? "", data);
    const label = useValueItem(renderer.label ?? "", data);
    const numerical = renderer.numerical ?? false;
    const validatorRaw = renderer.validator ?? null;

    const icon = iconDesc && <ModularAvatar item={iconDesc.type} />;
    const iconPos = iconDesc && (iconDesc.position ?? "start");

    const [val, setVal] = useFormField<string | number>(renderer.fieldId);
    const [errorText, setErrorText] = useState<string | undefined>(undefined);

    return (
        <div className="render-item child text-field">
            <TextField
                placeholder={placeholder}
                label={renderer.label && label}
                variant={variant}
                id={renderer.fieldId}
                value={val ?? ""}
                onChange={(event) => {
                    let current: any = event.target.value;
                    if (numerical) {
                        if (isNaN(Number(current))) {
                            setErrorText(
                                `${loc("error.renderer.root")}: ${loc(
                                    "error.renderer.not_number"
                                )}`
                            );
                            return;
                        }
                        current = Number(current);
                    }
                    if (validatorRaw) {
                        const result = parseFunction(
                            validatorRaw,
                            data,
                            formData
                        );
                        if (result === false) {
                            setErrorText(
                                `${loc("error.renderer.root")}: ${loc(
                                    "error.renderer.validation"
                                )}`
                            );
                            return;
                        } else if (typeof result === "string") {
                            setErrorText(
                                `${loc("error.renderer.root")}: ${result}`
                            );
                            return;
                        }
                    }
                    setErrorText(undefined);
                    setVal(current);
                }}
                fullWidth={fullWidth}
                helperText={errorText}
                error={errorText !== undefined}
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
                multiline={
                    renderer.lines !== undefined &&
                    renderer.lines !== 1 &&
                    renderer.lines !== 0
                }
                minRows={
                    renderer.lines !== undefined && renderer.lines !== "auto"
                        ? renderer.lines
                        : undefined
                }
                maxRows={
                    renderer.lines !== undefined && renderer.lines !== "auto"
                        ? renderer.lines
                        : undefined
                }
            />
        </div>
    );
};
