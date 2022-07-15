import {
    Box,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    MenuItem,
    TextField,
    Stack,
    InputAdornment,
    Chip,
    DialogActions,
    Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { MdAccountTree, MdBook, MdCreate, MdExtension } from "react-icons/md";
import { MinimalPluginModel } from "../../models/plugin";
import { ApiResponse, get } from "../../util/api";
import { loc } from "../../util/localization";
import "./styles/index.scss";

export function NewGameDialog(props: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [plugins, setPlugins] = useState<{
        [key: string]: MinimalPluginModel;
    }>({});

    const [valueName, setValueName] = useState<string>("");
    const [valueSystem, setValueSystem] = useState<string>("");
    const [valuePlugins, setValuePlugins] = useState<string[]>([]);

    useEffect(() => {
        get<MinimalPluginModel[]>("/plugins").then(
            (result: ApiResponse<MinimalPluginModel[]>) => {
                if (result.success) {
                    let newPlugins: { [key: string]: MinimalPluginModel } = {};
                    result.value.forEach((model) => {
                        newPlugins[model.slug] = model;
                    });
                    setPlugins(newPlugins);
                }
            }
        );
    }, []);

    function handleClose() {
        props.setOpen(false);
        setValueName("");
        setValueSystem("");
        setValuePlugins([]);
    }

    return (
        <Dialog open={props.open} onClose={handleClose} fullWidth>
            <DialogTitle>{loc("games.main.dialog.title")}</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <TextField
                        variant="filled"
                        fullWidth
                        required
                        label={loc("games.main.dialog.name")}
                        value={valueName}
                        onChange={(event) => setValueName(event.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdCreate size={20} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <span>
                        <TextField
                            label={loc("games.main.dialog.system")}
                            value={valueSystem}
                            onChange={(event) =>
                                setValueSystem(event.target.value)
                            }
                            required
                            variant="filled"
                            fullWidth
                            select
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <MdBook size={20} />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            {Object.keys(plugins).map((slug: string) =>
                                plugins[slug].tags.includes("system") ? (
                                    <MenuItem value={slug} key={slug}>
                                        {plugins[slug].displayName}
                                    </MenuItem>
                                ) : (
                                    <></>
                                )
                            )}
                        </TextField>
                        {valueSystem.length > 0 ? (
                            <Tooltip
                                title={loc("games.main.dialog.dependencies")}
                                placement="left"
                            >
                                <Stack
                                    direction={"row"}
                                    spacing={1}
                                    sx={{
                                        marginTop: "16px",
                                    }}
                                >
                                    <MdAccountTree
                                        size={20}
                                        style={{ marginTop: "6px" }}
                                    />
                                    {plugins[valueSystem].dependencies.map(
                                        (p) => (
                                            <Chip
                                                key={p}
                                                label={plugins[p].displayName}
                                            />
                                        )
                                    )}
                                </Stack>
                            </Tooltip>
                        ) : (
                            <></>
                        )}
                    </span>
                    <TextField
                        label={loc("games.main.dialog.plugins")}
                        value={valuePlugins}
                        onChange={(event) =>
                            setValuePlugins(
                                event.target.value as unknown as string[]
                            )
                        }
                        variant="filled"
                        fullWidth
                        select
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdExtension size={20} />
                                </InputAdornment>
                            ),
                        }}
                        SelectProps={{
                            multiple: true,
                            renderValue: (selected) => (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                    }}
                                >
                                    {(selected as string[]).map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            ),
                        }}
                        disabled={
                            Object.keys(plugins).filter(
                                (slug) =>
                                    !plugins[slug].tags.includes("system") &&
                                    (valueSystem.length === 0 ||
                                        !plugins[
                                            valueSystem
                                        ].dependencies.includes(slug))
                            ).length === 0
                        }
                    >
                        {Object.keys(plugins).map((slug: string) =>
                            !plugins[slug].tags.includes("system") &&
                            (valueSystem.length === 0 ||
                                !plugins[valueSystem].dependencies.includes(
                                    slug
                                )) ? (
                                <MenuItem value={slug} key={slug}>
                                    {plugins[slug].displayName}
                                </MenuItem>
                            ) : (
                                <></>
                            )
                        )}
                    </TextField>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={handleClose}>
                    {loc("generic.cancel")}
                </Button>
                <Button
                    variant="contained"
                    disabled={
                        valueName.length === 0 || valueSystem.length === 0
                    }
                >
                    {loc("generic.create")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
