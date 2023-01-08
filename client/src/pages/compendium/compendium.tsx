import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Paper,
    Stack,
    TablePagination,
    TextField,
    Tooltip,
    useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdExtension, MdSearch } from "react-icons/md";
import { loc } from "../../util/localization";
import "./style.scss";
import "./expanded.scss";
import {
    DataSearchField,
    DataSource,
    MinimalPluginModel,
    PluginManifest,
} from "../../models/plugin";
import { get, post } from "../../util/api";
import { useSnackbar } from "notistack";
import { useHorizontalScroll } from "../../util/hscroll";
import { DataItem, DataSearchResult } from "../../models/compendium";
import { CompendiumItemRenderer } from "./renderers/compendiumItem";
import { Masonry } from "@mui/lab";
import { ModularRenderer } from "../../libs/modular-renderer";
import { AvatarItem } from "./renderers/avatar";
import { SearchPopup } from "./searchPopup";
import { parseValueItem } from "../../libs/modular-renderer/utility/parsers";
import { useSearchParams } from "react-router-dom";

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

    const [resultCount, setResultCount] = useState<number>(0);
    const [resultPage, setResultPage] = useState<number>(0);
    const [resultsPerPage, setResultsPerPage] = useState<number>(24);
    const [currentFields, setCurrentFields] = useState<{
        [key: string]: DataSearchField;
    }>({});

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (
            searchParams.get("plugin") &&
            searchParams.get("category") &&
            searchParams.get("fields")
        ) {
            const searchPlugin = searchParams.get("plugin");
            const searchCategory = searchParams.get("category");
            const searchQueryFields = JSON.parse(
                searchParams.get("fields") || "{}"
            );

            setCategory(searchCategory);
            setPlugin(searchPlugin ?? plugin);
            setLoadingResults(true);

            post<DataSearchResult>(`/plugins/${searchPlugin}/data/search`, {
                body: {
                    category: searchCategory,
                    all_required: true,
                    fields: searchQueryFields,
                },
            }).then((result) => {
                if (result.success) {
                    const results = result.value.results;
                    const sortedResults = results.sort((a, b) =>
                        a.name < b.name ? -1 : a.name === b.name ? 0 : 1
                    );
                    setSearchResults(sortedResults);
                    setResultCount(result.value.total_results);
                    if (sortedResults.length === 1) {
                        setExpandedDialog(sortedResults[0]);
                    }
                } else {
                    enqueueSnackbar(result.message, {
                        autoHideDuration: 3000,
                    });
                }
                setLoadingResults(false);
            });
        }
    }, [searchParams]);

    useEffect(() => {
        if (plugin !== "") {
            return;
        }
        get<MinimalPluginModel[]>("/plugins", {
            urlParams: { tag: "data_source" },
        }).then((result) => {
            if (result.success) {
                setAvailablePlugins(result.value);
                setPlugin(searchParams.get("plugin") ?? result.value[0].slug);

                if (plugin.length > 0) {
                    get<PluginManifest>("/plugins/" + plugin).then((result) => {
                        if (result.success) {
                            setCurrentPlugin(result.value);
                            if (result.value.data_source) {
                                setCategory(
                                    searchParams.get("category") ??
                                        result.value.data_source
                                            .default_category
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
                        setCategory(
                            searchParams.get("category") ??
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
    }, [plugin, enqueueSnackbar]);

    const [searchAnchor, setSearchAnchor] = useState<HTMLButtonElement | null>(
        null
    );

    function performSearch(
        fields: { [key: string]: DataSearchField },
        page: number,
        count: number
    ) {
        setCurrentFields(fields);
        if (plugin && category) {
            setLoadingResults(true);
            let filledFields: { [key: string]: DataSearchField } = {};
            Object.keys(fields).forEach((k) => {
                if (fields[k].value.length > 0) {
                    filledFields[k] = fields[k];
                }
            });
            post<DataSearchResult>(`/plugins/${plugin}/data/search`, {
                body: {
                    category: category,
                    all_required: true,
                    fields: filledFields,
                },
                urlParams: {
                    page: page.toString(),
                    count: count.toString(),
                },
            }).then((result) => {
                if (result.success) {
                    const results = result.value.results;
                    const sortedResults = results.sort((a, b) =>
                        a.name < b.name ? -1 : a.name === b.name ? 0 : 1
                    );
                    setSearchResults(sortedResults);
                    setResultCount(result.value.total_results);
                } else {
                    enqueueSnackbar(result.message, {
                        autoHideDuration: 3000,
                    });
                }
                setLoadingResults(false);
            });
        }
    }

    useEffect(() => {
        setResultPage(0);
        performSearch({}, 0, resultsPerPage);
    }, [currentPlugin, category]);

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
                                    onClick={() => {
                                        setSearchResults([]);
                                        setCategory(cat);
                                    }}
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
                    performSearch(fields, resultPage, resultsPerPage);
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
                        {searchResults.map((r) => {
                            //console.log("DATA", r);
                            return (
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
                            );
                        })}
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
                                {
                                    parseValueItem(
                                        currentPlugin.data_source?.categories[
                                            category
                                        ].renderer.displayName,
                                        expandedDialog
                                    ).result
                                }
                            </div>
                            <div className="subtitle">
                                {
                                    parseValueItem(
                                        currentPlugin.data_source?.categories[
                                            category
                                        ].renderer.source,
                                        expandedDialog
                                    ).result
                                }
                            </div>
                        </DialogTitle>
                        <DialogContent dividers>
                            <ModularRenderer
                                id={"dialog-expanded-" + expandedDialog.oid}
                                data={expandedDialog}
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
            <Paper className="pagination" elevation={3}>
                <TablePagination
                    component="div"
                    count={resultCount}
                    page={resultPage}
                    rowsPerPage={resultsPerPage}
                    onPageChange={(event, page) => {
                        setResultPage(page);
                        performSearch(currentFields, page, resultsPerPage);
                    }}
                    onRowsPerPageChange={(event) => {
                        setResultsPerPage(parseInt(event.target.value, 10));
                        performSearch(
                            currentFields,
                            resultPage,
                            parseInt(event.target.value, 10)
                        );
                    }}
                    rowsPerPageOptions={[8, 12, 16, 24, 32, 48, 64]}
                    labelRowsPerPage={"Results Per Page:"}
                />
            </Paper>
        </Box>
    );
}
