import {
    Fab,
    Box,
    Tooltip,
    Card,
    CardHeader,
    CardMedia,
    CardContent,
    Typography,
    CardActions,
    IconButton,
    Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { MdAdd, MdOpenInNew, MdPerson, MdPersonAdd } from "react-icons/md";
import { UserInfoModel } from "../../models/account";
import { loc } from "../../util/localization";
import "./styles/index.scss";
import { NewGameDialog } from "./newGameDialog";
import { MinimalGame } from "../../models/game";
import { get } from "../../util/api";

export function GamesListPage(props: { userInfo: UserInfoModel }) {
    const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
    const [games, setGames] = useState<MinimalGame[]>([]);

    function loadGames() {
        get<MinimalGame[]>("/games").then((result) => {
            if (result.success) {
                setGames(result.value);
            }
        });
    }

    useEffect(loadGames, []);

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
                <div className="game-list">
                    {games.map((game: MinimalGame) => (
                        <Card key={game.id} className="game-item">
                            <CardHeader
                                title={game.name}
                                subheader={game.system}
                            />
                            <CardMedia
                                image={
                                    game.image.length === 0
                                        ? "assets/default-game.jpg"
                                        : game.image
                                }
                                height="192"
                                component="img"
                                alt={loc("games.main.items.img_alt", {
                                    game: game.name,
                                })}
                            />
                            <CardContent>
                                <Typography variant="body1">
                                    {loc("games.main.items.owner", {
                                        owner: game.owner_name,
                                    })}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Box className="num-players">
                                    <MdPerson size={24} />
                                    <Typography variant="body1">
                                        {game.participants.length}
                                    </Typography>
                                </Box>
                                <Stack
                                    className="buttons"
                                    spacing={1}
                                    direction={"row"}
                                >
                                    <Tooltip
                                        title={loc("games.main.items.invite")}
                                    >
                                        <IconButton>
                                            <MdPersonAdd />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip
                                        title={loc("games.main.items.open")}
                                    >
                                        <IconButton>
                                            <MdOpenInNew />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </CardActions>
                        </Card>
                    ))}
                </div>
            </Box>
            <NewGameDialog
                open={addDialogOpen}
                setOpen={setAddDialogOpen}
                onCreate={loadGames}
            />
        </>
    );
}
