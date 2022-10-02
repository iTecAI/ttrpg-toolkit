import {
    Popover,
    Typography,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Slider,
    FormControlLabel,
    Switch,
    Tooltip,
    IconButton,
    Button,
    Paper,
} from "@mui/material";
import { useState, useEffect } from "react";
import { MdSearch, MdFormatClear } from "react-icons/md";
import {
    DataSource,
    DataSearchField,
    SearchParams,
    SearchField,
} from "../../models/plugin";
import { get, ApiResponse } from "../../util/api";
import { loc } from "../../util/localization";

export function SearchPopup(props: {
    dataSource: DataSource | null;
    category: string | null;
    plugin: string | null;
    anchor: HTMLButtonElement | null;
    onClose: () => void;
    onSubmit: (fields: { [key: string]: DataSearchField }) => void;
}) {
    const [fields, setFields] = useState<{ [key: string]: DataSearchField }>(
        {}
    );
    const [params, setParams] = useState<{ [key: string]: SearchParams }>({});

    useEffect(() => {
        if (!props.plugin || !props.category) {
            return;
        }
        get<{ [key: string]: SearchParams }>(
            `/plugins/${props.plugin}/data/search_params/${props.category}`
        ).then((value: ApiResponse<{ [key: string]: SearchParams }>) => {
            if (value.success) {
                setParams(value.value);
                let newFields: { [key: string]: DataSearchField } = {};
                if (props.dataSource && props.category) {
                    Object.keys(
                        props.dataSource.categories[props.category]
                            .search_fields
                    ).forEach((value: string) => {
                        let field: SearchField = (
                            props.dataSource as DataSource
                        ).categories[props.category as string].search_fields[
                            value
                        ];

                        let dataField: DataSearchField = {
                            field_type: field.type,
                            value: "",
                        };

                        if (field.type === "string") {
                            dataField.exact = false;
                        }
                        if (field.type === "number") {
                            dataField.comparator = "=";
                        }

                        newFields[value] = dataField;
                    });
                }
                setFields(newFields);
            }
        });
    }, [props.dataSource, props.category, props.plugin]);

    return (
        <Popover
            open={Boolean(props.anchor)}
            anchorEl={props.anchor}
            onClose={props.onClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            className="search-popup"
        >
            <MdSearch className="search-icon" />
            <Typography variant="h5" className="title">
                {loc("compendium.search.title")}
            </Typography>
            <Stack spacing={1}>
                {props.dataSource && props.category ? (
                    Object.keys(
                        props.dataSource.categories[props.category]
                            .search_fields
                    ).map((f) => {
                        if (!fields[f]) {
                            return null;
                        }
                        let field = (props.dataSource as DataSource).categories[
                            props.category as string
                        ].search_fields[f];
                        let inputLine: JSX.Element = <></>;
                        switch (field.type) {
                            case "string":
                                inputLine = (
                                    <Stack direction="row">
                                        <FormControl sx={{ width: "20%" }}>
                                            <InputLabel
                                                shrink={true}
                                            ></InputLabel>
                                            <Select
                                                variant="standard"
                                                value={Number(fields[f].exact)}
                                                onChange={(e) => {
                                                    let pfields = JSON.parse(
                                                        JSON.stringify(fields)
                                                    );
                                                    pfields[f].exact = Boolean(
                                                        e.target.value
                                                    );
                                                    setFields(pfields);
                                                }}
                                            >
                                                <MenuItem value={0}>
                                                    {loc(
                                                        "compendium.search.exact.false"
                                                    )}
                                                </MenuItem>
                                                <MenuItem value={1}>
                                                    {loc(
                                                        "compendium.search.exact.true"
                                                    )}
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            variant="standard"
                                            key={f}
                                            label={field.label}
                                            InputLabelProps={{ shrink: true }}
                                            value={fields[f].value}
                                            onChange={(event) => {
                                                let pfields = JSON.parse(
                                                    JSON.stringify(fields)
                                                );
                                                pfields[f].value =
                                                    event.target.value;
                                                setFields(pfields);
                                            }}
                                            sx={{
                                                width: "calc(80% - 4px)",
                                                marginLeft: "4px",
                                            }}
                                        />
                                    </Stack>
                                );
                                break;

                            case "select":
                                inputLine = (
                                    <FormControl sx={{ width: "100%" }}>
                                        <InputLabel shrink={true}>
                                            {field.label}
                                        </InputLabel>
                                        <Select
                                            variant="standard"
                                            key={f}
                                            value={fields[f].value}
                                            onChange={(event) => {
                                                let pfields = JSON.parse(
                                                    JSON.stringify(fields)
                                                );
                                                pfields[f].value =
                                                    event.target.value;
                                                setFields(pfields);
                                            }}
                                        >
                                            <MenuItem value={""}>-</MenuItem>
                                            {params[f] &&
                                                params[f].choices &&
                                                params[f].choices?.map((c) => (
                                                    <MenuItem value={c} key={c}>
                                                        {c}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                );
                                break;

                            case "number":
                                inputLine = (
                                    <Stack direction={"row"}>
                                        <FormControl
                                            sx={{
                                                width: "180px",
                                            }}
                                        >
                                            <InputLabel shrink={true}>
                                                {field.label}
                                            </InputLabel>
                                            <Select
                                                variant="standard"
                                                key={f}
                                                value={fields[f].comparator}
                                                onChange={(event) => {
                                                    let pfields = JSON.parse(
                                                        JSON.stringify(fields)
                                                    );
                                                    pfields[f].comparator =
                                                        event.target.value;
                                                    setFields(pfields);
                                                }}
                                            >
                                                <MenuItem value="<">
                                                    {loc(
                                                        "compendium.search.comp.lt"
                                                    )}
                                                </MenuItem>
                                                <MenuItem value="<=">
                                                    {loc(
                                                        "compendium.search.comp.lte"
                                                    )}
                                                </MenuItem>
                                                <MenuItem value="=">
                                                    {loc(
                                                        "compendium.search.comp.eq"
                                                    )}
                                                </MenuItem>
                                                <MenuItem value=">=">
                                                    {loc(
                                                        "compendium.search.comp.gte"
                                                    )}
                                                </MenuItem>
                                                <MenuItem value=">">
                                                    {loc(
                                                        "compendium.search.comp.gt"
                                                    )}
                                                </MenuItem>
                                                <MenuItem value="!=">
                                                    {loc(
                                                        "compendium.search.comp.ne"
                                                    )}
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl
                                            sx={{
                                                width: "calc(100% - 180px)",
                                                marginLeft: "16px",
                                                transform: "translate(0, 16px)",
                                            }}
                                        >
                                            <Slider
                                                track={false}
                                                min={
                                                    params && params[f]
                                                        ? params[f].min ?? 0
                                                        : 0
                                                }
                                                max={
                                                    params && params[f]
                                                        ? params[f].max ?? 100
                                                        : 100
                                                }
                                                value={Number(fields[f].value)}
                                                onChange={(_, value) => {
                                                    let pfields = JSON.parse(
                                                        JSON.stringify(fields)
                                                    );
                                                    pfields[f].value =
                                                        String(value);
                                                    setFields(pfields);
                                                }}
                                                valueLabelDisplay="auto"
                                            />
                                        </FormControl>
                                    </Stack>
                                );
                                break;

                            case "boolean":
                                inputLine = (
                                    <FormControlLabel
                                        labelPlacement="start"
                                        sx={{
                                            "& .MuiTypography-root": {
                                                position: "absolute",
                                                left: "0px",
                                            },
                                            position: "relative",
                                            width: "100%",
                                        }}
                                        control={
                                            <Switch
                                                value={Boolean(fields[f].value)}
                                                onChange={(_, checked) => {
                                                    let pfields = JSON.parse(
                                                        JSON.stringify(fields)
                                                    );
                                                    pfields[f].value =
                                                        String(checked);
                                                    setFields(pfields);
                                                }}
                                            />
                                        }
                                        label={field.label}
                                    />
                                );
                        }
                        return (
                            <Paper
                                sx={{
                                    padding: "8px",
                                    position: "relative",
                                    paddingTop: "16px",
                                    border:
                                        fields[f].value.length > 0
                                            ? "1px solid #388e3c"
                                            : "1px solid #388e3c00",
                                    boxSizing: "border-box",
                                }}
                                elevation={fields[f].value.length > 0 ? 1 : 2}
                            >
                                <Stack direction={"row"} spacing={2} key={f}>
                                    <span
                                        style={{
                                            width: "calc(100% - 40px)",
                                            position: "relative",
                                        }}
                                    >
                                        {inputLine}
                                    </span>
                                    <Tooltip
                                        title={loc("compendium.search.clear")}
                                    >
                                        <IconButton
                                            sx={{
                                                width: "32px",
                                                height: "32px",
                                                position: "absolute",
                                                top: "50%",
                                                right: "8px",
                                                transform: "translate(0, -50%)",
                                            }}
                                            onClick={() => {
                                                let pfields = JSON.parse(
                                                    JSON.stringify(fields)
                                                );
                                                pfields[f].value = "";
                                                setFields(pfields);
                                            }}
                                        >
                                            <MdFormatClear />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Paper>
                        );
                    })
                ) : (
                    <></>
                )}
            </Stack>
            <Button
                fullWidth
                variant="outlined"
                className="search-submit"
                startIcon={<MdSearch />}
                onClick={() => {
                    props.onSubmit(fields);
                    props.onClose();
                }}
            >
                {loc("generic.search")}
            </Button>
        </Popover>
    );
}
