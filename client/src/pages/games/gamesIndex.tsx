import {
    Fab,
    Box,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormControlLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import { UserInfoModel } from "../../models/account";
import { MinimalPluginModel } from "../../models/plugin";
import { ApiResponse, get } from "../../util/api";
import { loc } from "../../util/localization";
import "./styles/index.scss";

function NewGameDialog(props: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [plugins, setPlugins] = useState<{
        [key: string]: MinimalPluginModel;
    }>({});

    const [valueSystem, setValueSystem] = useState<string>("");

    useEffect(() => {
        get<MinimalPluginModel[]>("/plugins").then(
            (result: ApiResponse<MinimalPluginModel[]>) => {
                if (result.success) {
                    let newPlugins: { [key: string]: MinimalPluginModel } = {};
                    result.value.forEach((model) => {
                        newPlugins[model.slug] = model;
                    });
                    setPlugins(newPlugins);
                    setValueSystem(Object.keys(newPlugins)[0]);
                }
            }
        );
    }, []);

    return (
        <Dialog
            open={props.open}
            onClose={() => props.setOpen(false)}
            fullWidth
        >
            <DialogTitle>{loc("games.main.dialog.title")}</DialogTitle>
            <DialogContent>
                <FormControl variant="filled" fullWidth required>
                    <InputLabel id="system-select-label">
                        {loc("games.main.dialog.system")}
                    </InputLabel>
                    <Select
                        labelId="system-select-label"
                        value={valueSystem}
                        onChange={(event) => setValueSystem(event.target.value)}
                        required
                    >
                        {Object.keys(plugins).map((slug: string) =>
                            plugins[slug].tags.includes("system") ? (
                                <MenuItem value={slug}>
                                    {plugins[slug].displayName}
                                </MenuItem>
                            ) : (
                                <></>
                            )
                        )}
                    </Select>
                </FormControl>
            </DialogContent>
        </Dialog>
    );
}

export function GamesListPage(props: { userInfo: UserInfoModel }) {
    const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);

    return (
        <>
            <Box className="games-container">
                <Tooltip title={loc("games.main.new")} placement="top">
                    <Fab
                        color="primary"
                        aria-label="new game"
                        className="add-game-button"
                        onClick={() => setAddDialogOpen(true)}
                    >
                        <MdAdd size={"24px"} />
                    </Fab>
                </Tooltip>
            </Box>
            <NewGameDialog open={addDialogOpen} setOpen={setAddDialogOpen} />
        </>
    );
}
