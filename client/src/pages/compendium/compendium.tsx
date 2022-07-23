import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Paper,
    Popover,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import Masonry from "react-masonry-css";
import React, { useEffect, useState } from "react";
import { MdExtension, MdSearch } from "react-icons/md";
import { loc } from "../../util/localization";
import "./style.scss";
import {
    DataSource,
    MinimalPluginModel,
    PluginManifest,
} from "../../models/plugin";
import { get, post } from "../../util/api";
import { useSnackbar } from "notistack";
import { useHorizontalScroll } from "../../util/hscroll";
import { CardRendererModel, DataItem } from "../../models/compendium";
import CardRenderer from "./renderers/CardRenderer";

function SearchPopup(props: {
    dataSource: DataSource | null;
    category: string | null;
    anchor: HTMLButtonElement | null;
    onClose: () => void;
    onSubmit: (fields: { [key: string]: string }) => void;
}) {
    const [fields, setFields] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        let newFields: { [key: string]: string } = {};
        if (props.dataSource && props.category) {
            props.dataSource.categories[props.category].search_fields.forEach(
                (v) => {
                    newFields[v.type] = "";
                }
            );
        }
        setFields(newFields);
    }, [props.dataSource, props.category]);

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
                    props.dataSource.categories[
                        props.category
                    ].search_fields.map((f) => (
                        <TextField
                            variant="standard"
                            key={f.type}
                            label={f.display_name}
                            value={fields[f.type]}
                            onChange={(event) => {
                                let pfields = JSON.parse(
                                    JSON.stringify(fields)
                                );
                                pfields[f.type] = event.target.value;
                                setFields(pfields);
                            }}
                        />
                    ))
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

    const { enqueueSnackbar } = useSnackbar();

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
                                        borderBottom: "2px solid",
                                        borderColor:
                                            cat === category
                                                ? "primary"
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
                dataSource={
                    currentPlugin && currentPlugin.data_source
                        ? currentPlugin.data_source
                        : null
                }
                category={category}
                anchor={searchAnchor}
                onClose={() => setSearchAnchor(null)}
                onSubmit={(fields) => {
                    if (plugin && category) {
                        setLoadingResults(true);
                        post<DataItem[]>(
                            `/plugins/${plugin}/data/${category}/search`,
                            {
                                body: { fields: fields },
                            }
                        ).then((result) => {
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
            {currentPlugin && currentPlugin.data_source && category ? (
                currentPlugin.data_source.categories[category].renderer
                    .render_mode === "card" &&
                currentPlugin.data_source.categories[category].renderer.card ? (
                    <Masonry
                        className="item-area card"
                        breakpointCols={{
                            800: 2,
                            1100: 3,
                            1600: 4,
                            default: 5,
                        }}
                        columnClassName="card-column"
                    >
                        {searchResults.map((item) => {
                            let renderer = (
                                currentPlugin.data_source as DataSource
                            ).categories[category].renderer;
                            return (
                                <CardRenderer
                                    key={item.name}
                                    data={item}
                                    renderer={
                                        renderer.card as CardRendererModel
                                    }
                                />
                            );
                        })}
                    </Masonry>
                ) : null
            ) : null}
        </Box>
    );
}
