import { Autocomplete, Chip, InputAdornment, TextField } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import { RenderAutocompleteFieldItem } from "../types/renderTypes";
import { useValueItem } from "../utility/hooks";
import { ModularAvatar } from "./common";
import { useFormField } from "../utility/document_communication";
import { useEffect, useMemo, useState } from "react";
import { matchArrays } from "../utility/arraymatch";
import { ValueItem } from "../types";
import { isArray } from "../types/guards";

function useOptions(input: string[] | ValueItem, data: any): string[] {
    const [instanceInput, setInstanceInput] = useState<string[] | ValueItem>(
        input
    );
    const [result, setResult] = useState<string[]>([]);
    const [instanceData, setInstanceData] = useState<any>(data);

    useMemo(() => {
        if (JSON.stringify(input) === JSON.stringify(instanceInput)) {
            return;
        }
        setInstanceInput(input);
    }, [input]);

    useMemo(() => {
        if (JSON.stringify(data) === JSON.stringify(instanceData)) {
            return;
        }
        setInstanceData(JSON.parse(JSON.stringify(data)));
    }, [data]);

    const asVal = useValueItem(
        isArray(instanceInput) ? "" : instanceInput,
        instanceData
    );

    useMemo(() => {
        let res: string[];
        const cp = JSON.parse(JSON.stringify(instanceInput));
        if (isArray(cp)) {
            res = cp;
        } else {
            if (isArray(asVal)) {
                res = asVal;
            } else {
                res = [asVal];
            }
        }
        if (matchArrays(res, result)) {
            return;
        }
        setResult(res);
    }, [instanceInput, asVal]);

    return result;
}

export const AutocompleteFieldItem: RendererFunction<
    RenderAutocompleteFieldItem
> = (props: RendererFunctionProps<RenderAutocompleteFieldItem>) => {
    const { renderer, data } = props;

    const [dat, setDat] = useState<any>(data);

    useEffect(() => {
        if (JSON.stringify(dat) !== JSON.stringify(data)) {
            setDat(data);
        }
    }, [data]);

    const variant = renderer.variant ?? "outlined";
    const fullWidth = renderer.fullWidth ?? false;
    const iconDesc = renderer.icon ?? null;
    const placeholder = useValueItem(renderer.placeholder ?? "", dat);
    const label = useValueItem(renderer.label ?? "", dat);

    const options: any[] = useOptions(renderer.options, dat);

    const icon = iconDesc && <ModularAvatar item={iconDesc.type} />;
    const iconPos = iconDesc && (iconDesc.position ?? "start");

    const [val, setVal] = useFormField<any>(renderer.fieldId);

    return (
        <div className="render-item child select-field">
            <Autocomplete
                disablePortal
                multiple={renderer.multiple ?? false}
                placeholder={placeholder}
                freeSolo={renderer.allowAny ?? false}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label={renderer.label && label}
                        placeholder={placeholder}
                        variant={variant}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                                <>
                                    {iconDesc && (
                                        <InputAdornment
                                            position={iconPos ?? "start"}
                                        >
                                            {icon}
                                        </InputAdornment>
                                    )}
                                    {params.InputProps.startAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                id={renderer.fieldId}
                value={renderer.multiple ? val ?? [] : val ?? ""}
                onChange={(_, value) => {
                    setVal(value);
                }}
                fullWidth={fullWidth}
                options={options}
                renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                        <Chip label={option} {...getTagProps({ index })} />
                    ))
                }
            />
        </div>
    );
};
