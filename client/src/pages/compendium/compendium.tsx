import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputAdornment,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Popover,
    Select,
    Slider,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdClear, MdExtension, MdSearch } from "react-icons/md";
import { loc } from "../../util/localization";
import "./style.scss";
import "./expanded.scss";
import {
    DataSearchField,
    DataSource,
    MinimalPluginModel,
    PluginManifest,
    SearchField,
    SearchParams,
} from "../../models/plugin";
import { ApiResponse, get, post } from "../../util/api";
import { useSnackbar } from "notistack";
import { useHorizontalScroll } from "../../util/hscroll";
import { DataItem } from "../../models/compendium";
import { CompendiumItemRenderer } from "./renderers/compendiumItem";
import { Masonry } from "@mui/lab";
import { parseValueItem } from "../../libs/modoc/util";
import { ModularRenderer, MuiRenderParser } from "../../libs/modoc";
import { AvatarItem } from "./renderers/avatar";

function SearchPopup(props: {
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
            <Stack spacing={2}>
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
                                            <InputLabel>
                                                {loc(
                                                    "compendium.search.exact.title"
                                                )}
                                            </InputLabel>
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
                                        <InputLabel>{field.label}</InputLabel>
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
                                                width: "30%",
                                            }}
                                        >
                                            <InputLabel>
                                                {loc(
                                                    "compendium.search.comp.title"
                                                )}
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
                                                    {"<"}
                                                </MenuItem>
                                                <MenuItem value="<=">
                                                    {"<="}
                                                </MenuItem>
                                                <MenuItem value="=">
                                                    {"="}
                                                </MenuItem>
                                                <MenuItem value=">=">
                                                    {">="}
                                                </MenuItem>
                                                <MenuItem value=">">
                                                    {">"}
                                                </MenuItem>
                                                <MenuItem value="!=">
                                                    {"!="}
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                        <FormControl
                                            sx={{
                                                width: "calc(70% - 32px)",
                                                marginLeft: "16px",
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {field.label}
                                            </Typography>
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
                            <Stack direction={"row"} spacing={2} key={f}>
                                <span
                                    style={{
                                        width: "calc(100% - 40px)",
                                        position: "relative",
                                    }}
                                >
                                    {inputLine}
                                </span>
                                <Tooltip title={loc("compendium.search.clear")}>
                                    <IconButton
                                        sx={{
                                            width: "32px",
                                            height: "32px",
                                            transform: "translate(0, 8px)",
                                        }}
                                        onClick={() => {
                                            let pfields = JSON.parse(
                                                JSON.stringify(fields)
                                            );
                                            pfields[f].value = "";
                                            setFields(pfields);
                                        }}
                                    >
                                        <MdClear />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
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

export function Compendium() {
    const [plugin, setPlugin] = useState<string>("");
    const [currentPlugin, setCurrentPlugin] = useState<PluginManifest | null>(
        null
    );
    const [availablePlugins, setAvailablePlugins] = useState<
        MinimalPluginModel[]
    >([]);
    const [loadingPlugin, setLoadingPlugin] = useState<boolean>(true);
    const [category, setCategory] = useState<string | null>(null);
    const hscroll = useHorizontalScroll(0.5);

    const [searchResults, setSearchResults] = useState<DataItem[]>([]);
    const [loadingResults, setLoadingResults] = useState<boolean>(false);

    const [expandedDialog, setExpandedDialog] = useState<DataItem | null>(null);

    const { enqueueSnackbar } = useSnackbar();

    const theme = useTheme();

    useEffect(() => {
        if (plugin !== "") {
            return;
        }
        get<MinimalPluginModel[]>("/plugins", {
            urlParams: { tag: "data_source" },
        }).then((result) => {
            if (result.success) {
                setAvailablePlugins(result.value);
                setPlugin(result.value[0].slug);

                if (plugin.length > 0) {
                    get<PluginManifest>("/plugins/" + plugin).then((result) => {
                        if (result.success) {
                            setCurrentPlugin(result.value);
                            if (result.value.data_source) {
                                setCategory(
                                    result.value.data_source.default_category
                                );
                            }
                        } else {
                            enqueueSnackbar(result.message, {
                                autoHideDuration: 3000,
                            });
                        }
                        setLoadingPlugin(false);
                    });
                }
            } else {
                enqueueSnackbar(result.message, { autoHideDuration: 3000 });
            }
        });
    }, [plugin, enqueueSnackbar]);

    useEffect(() => {
        setLoadingPlugin(true);
        if (plugin.length > 0) {
            get<PluginManifest>("/plugins/" + plugin).then((result) => {
                if (result.success) {
                    setCurrentPlugin(result.value);
                    if (result.value.data_source) {
                        setCategory(result.value.data_source.default_category);
                    }
                } else {
                    enqueueSnackbar(result.message, {
                        autoHideDuration: 3000,
                    });
                }
                setLoadingPlugin(false);
            });
        }
    }, [plugin, enqueueSnackbar]);

    const [searchAnchor, setSearchAnchor] = useState<HTMLButtonElement | null>(
        null
    );

    useEffect(() => {
        console.log(searchResults, currentPlugin, category);
    }, [searchResults, currentPlugin, category]);

    return (
        <Box className="compendium-root">
            <Paper className="compendium-nav">
                {loadingPlugin ? (
                    <LinearProgress className="loading-plugin" />
                ) : (
                    <></>
                )}
                <Stack direction="row" spacing={2}>
                    <TextField
                        className="plugin-selector"
                        select
                        variant="filled"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdExtension />
                                </InputAdornment>
                            ),
                        }}
                        label={loc("compendium.nav.select_plugin")}
                        value={plugin}
                        onChange={(event) => setPlugin(event.target.value)}
                        size="small"
                    >
                        {availablePlugins.map(
                            (pluginItem: MinimalPluginModel) => (
                                <MenuItem
                                    key={pluginItem.slug}
                                    value={pluginItem.slug}
                                >
                                    {pluginItem.displayName}
                                </MenuItem>
                            )
                        )}
                    </TextField>
                    <Stack
                        spacing={1}
                        direction="row"
                        className="tabs"
                        ref={hscroll}
                    >
                        {currentPlugin && currentPlugin.data_source ? (
                            Object.keys(
                                currentPlugin.data_source.categories
                            ).map((cat) => (
                                <Button
                                    key={cat}
                                    variant="text"
                                    className="tab-button"
                                    sx={{
                                        backgroundColor:
                                            cat === category
                                                ? theme.palette.primary.main +
                                                  "32"
                                                : undefined,
                                    }}
                                    onClick={() => setCategory(cat)}
                                >
                                    {
                                        (
                                            currentPlugin.data_source as DataSource
                                        ).categories[cat].display_name
                                    }
                                </Button>
                            ))
                        ) : (
                            <></>
                        )}
                    </Stack>
                    <Tooltip title={loc("compendium.nav.search")}>
                        <IconButton
                            className="search-btn"
                            size="large"
                            onClick={(event) =>
                                setSearchAnchor(event.currentTarget)
                            }
                        >
                            <MdSearch />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Paper>
            <SearchPopup
                plugin={currentPlugin?.plugin_data.slug ?? null}
                dataSource={
                    currentPlugin && currentPlugin.data_source
                        ? currentPlugin.data_source
                        : null
                }
                category={category}
                anchor={searchAnchor}
                onClose={() => setSearchAnchor(null)}
                onSubmit={(fields) => {
                    console.log(fields);
                    if (plugin && category) {
                        setLoadingResults(true);
                        let filledFields: { [key: string]: DataSearchField } =
                            {};
                        Object.keys(fields).forEach((k) => {
                            if (fields[k].value.length > 0) {
                                filledFields[k] = fields[k];
                            }
                        });
                        post<any[]>(`/plugins/${plugin}/data/search`, {
                            body: {
                                category: category,
                                all_required: true,
                                fields: filledFields,
                            },
                        }).then((result) => {
                            if (result.success) {
                                let sortedResults = result.value.sort((a, b) =>
                                    a.name < b.name
                                        ? -1
                                        : a.name === b.name
                                        ? 0
                                        : 1
                                );
                                setSearchResults(sortedResults);
                            } else {
                                enqueueSnackbar(result.message, {
                                    autoHideDuration: 3000,
                                });
                            }
                            setLoadingResults(false);
                        });
                    }
                }}
            />
            {loadingResults ? (
                <LinearProgress className="loading-results" />
            ) : null}
            {searchResults &&
            currentPlugin &&
            currentPlugin.data_source &&
            category &&
            Object.keys(currentPlugin.data_source?.categories).includes(
                category
            ) ? (
                <div className="compendium-item-scroller">
                    <Masonry
                        columns={4}
                        spacing={1}
                        className="compendium-item-container"
                    >
                        {searchResults.map(
                            (r) =>
                                currentPlugin.data_source?.categories[category]
                                    .renderer && (
                                    <CompendiumItemRenderer
                                        setExpanded={setExpandedDialog}
                                        data={r}
                                        renderer={
                                            currentPlugin.data_source
                                                ?.categories[category].renderer
                                        }
                                        key={Math.random()}
                                    />
                                )
                        )}
                    </Masonry>
                </div>
            ) : (
                <></>
            )}
            <Dialog
                open={Boolean(expandedDialog)}
                onClose={() => setExpandedDialog(null)}
                className="compendium-expanded-item"
                fullWidth={true}
                maxWidth={false}
            >
                {expandedDialog &&
                category &&
                currentPlugin &&
                currentPlugin.data_source?.categories[category].renderer ? (
                    <>
                        <DialogTitle
                            className={
                                "title-area" +
                                (currentPlugin.data_source?.categories[category]
                                    .renderer.avatar
                                    ? " avatar"
                                    : "")
                            }
                        >
                            {currentPlugin.data_source?.categories[category]
                                .renderer.avatar !== undefined ? (
                                <AvatarItem
                                    spec={
                                        currentPlugin.data_source?.categories[
                                            category
                                        ].renderer.avatar
                                    }
                                    data={expandedDialog}
                                />
                            ) : (
                                <></>
                            )}
                            <div className="title">
                                {parseValueItem(
                                    currentPlugin.data_source?.categories[
                                        category
                                    ].renderer.displayName,
                                    expandedDialog
                                )}
                            </div>
                            <div className="subtitle">
                                {parseValueItem(
                                    currentPlugin.data_source?.categories[
                                        category
                                    ].renderer.source,
                                    expandedDialog
                                )}
                            </div>
                        </DialogTitle>
                        <DialogContent dividers>
                            <ModularRenderer
                                data={expandedDialog}
                                parser={MuiRenderParser}
                                renderer={
                                    currentPlugin.data_source?.categories[
                                        category
                                    ].renderer.fullContents
                                }
                            />
                        </DialogContent>
                    </>
                ) : (
                    <></>
                )}
            </Dialog>
        </Box>
    );
}
