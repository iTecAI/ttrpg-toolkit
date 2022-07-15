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
    LinearProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
    MdAdd,
    MdExtension,
    MdOpenInNew,
    MdPerson,
    MdPersonAdd,
    MdStar,
} from "react-icons/md";
import { UserInfoModel } from "../../models/account";
import { loc } from "../../util/localization";
import "./styles/index.scss";
import { NewGameDialog } from "./newGameDialog";
import { MinimalGame } from "../../models/game";
import { get } from "../../util/api";
import { useSnackbar } from "notistack";

function GameCard(props: { game: MinimalGame; uid: string }) {
    const { game, uid } = props;
    return (
        <Card key={game.id} className={"game-item"}>
            {uid === game.game_master ? (
                <Tooltip
                    title={loc("games.main.items.gm-icon")}
                    disableInteractive
                >
                    <span className="gm-icon">
                        <MdStar size={20} />
                    </span>
                </Tooltip>
            ) : null}
            <CardHeader title={game.name} subheader={game.system} />
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
                <Stack
                    className="num-players-plugins"
                    direction={"row"}
                    spacing={1}
                >
                    <Tooltip
                        title={loc("games.main.items.n-participants")}
                        disableInteractive
                    >
                        <span>
                            <MdPerson size={24} />
                            <Typography variant="body1">
                                {game.participants.length}
                            </Typography>
                        </span>
                    </Tooltip>
                    <Tooltip
                        title={loc("games.main.items.n-plugins")}
                        disableInteractive
                    >
                        <span>
                            <MdExtension size={24} />
                            <Typography variant="body1">
                                {game.plugins.length}
                            </Typography>
                        </span>
                    </Tooltip>
                </Stack>
                <Stack className="buttons" spacing={1} direction={"row"}>
                    <Tooltip
                        title={loc("games.main.items.invite")}
                        disableInteractive
                    >
                        <IconButton>
                            <MdPersonAdd />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title={loc("games.main.items.open")}
                        disableInteractive
                    >
                        <IconButton>
                            <MdOpenInNew />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </CardActions>
        </Card>
    );
}

export function GamesListPage(props: { userInfo: UserInfoModel }) {
    const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
    const [games, setGames] = useState<MinimalGame[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const { enqueueSnackbar } = useSnackbar();

    function loadGames() {
        setLoading(true);
        get<MinimalGame[]>("/games").then((result) => {
            if (result.success) {
                setGames(result.value);
            } else {
                enqueueSnackbar(loc("games.main.load_failure"), {
                    variant: "error",
                    autoHideDuration: 5000,
                });
            }
            setLoading(false);
        });
    }

    useEffect(loadGames, [enqueueSnackbar]);

    return (
        <>
            <Box className="games-container">
                {loading && <LinearProgress />}
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
                        <GameCard game={game} uid={props.userInfo.userId} />
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
