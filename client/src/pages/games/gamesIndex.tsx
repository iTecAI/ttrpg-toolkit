import { Fab, Box, Tooltip } from "@mui/material";
import { useState } from "react";
import { MdAdd } from "react-icons/md";
import { UserInfoModel } from "../../models/account";
import { loc } from "../../util/localization";
import "./styles/index.scss";
import { NewGameDialog } from "./newGameDialog";

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
