import {
    Autocomplete,
    Avatar,
    Chip,
    InputAdornment,
    TextField,
} from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import { RenderContentSelector } from "../types/renderTypes";
import { useDisabled, useValueItem } from "../utility/hooks";
import { ModularAvatar } from "./common";
import { useFormField } from "../utility/document_communication";
import { useEffect, useState } from "react";
import { get } from "../../../util/api";
import { calculateGravatar } from "../../../util/gravatar";
import { useNavigate } from "react-router";

type ContentSearchResult = {
    oid: string;
    name: string;
    image: string | null;
    dataType: string;
};

export const ContentSelectorFieldItem: RendererFunction<
    RenderContentSelector
> = (props: RendererFunctionProps<RenderContentSelector>) => {
    const { renderer, data } = props;

    const [dat, setDat] = useState<any>(data);
    const disabled = useDisabled();

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

    const icon = iconDesc && <ModularAvatar item={iconDesc.type} />;
    const iconPos = iconDesc && (iconDesc.position ?? "start");

    const [val, setVal] = useFormField<any>(renderer.fieldId);
    const [search, setSearch] = useState<string>("");
    const [results, setResults] = useState<ContentSearchResult[]>([]);

    useEffect(() => {
        if (search.length > 2 && search.length % 2 === 0) {
            get<ContentSearchResult[]>("/content", {
                urlParams: renderer.allowedTypes
                    ? {
                          q: search,
                          t: renderer.allowedTypes.join(","),
                      }
                    : { q: search },
            }).then((result) => {
                if (result.success) {
                    setResults(result.value);
                }
            });
        }
    }, [search]);

    const nav = useNavigate();

    return (
        <div className="render-item child content-select-field">
            <Autocomplete
                disabled={disabled}
                inputValue={search}
                onInputChange={(event, value) => setSearch(value)}
                disablePortal
                multiple={renderer.multiple ?? false}
                placeholder={placeholder}
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
                    setSearch("");
                }}
                fullWidth={fullWidth}
                renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                        <Chip
                            label={option.name}
                            avatar={
                                <Avatar
                                    component="image"
                                    src={
                                        option.image
                                            ? `/api/user_content/${option.image}`
                                            : calculateGravatar(option.oid, 128)
                                    }
                                />
                            }
                            onClick={(event) => {
                                event.stopPropagation();
                                nav(`/content/folder/${option.oid}`);
                            }}
                            {...getTagProps({ index })}
                        />
                    ))
                }
                options={results.sort(
                    (a, b) => -b.dataType.localeCompare(a.dataType)
                )}
                groupBy={(option) => option.dataType}
                getOptionLabel={(option) => option.name}
                freeSolo
            />
        </div>
    );
};
