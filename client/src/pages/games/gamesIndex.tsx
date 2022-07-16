import {
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
    SpeedDial,
    SpeedDialAction,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    InputAdornment,
    DialogActions,
    Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
    MdAdd,
    MdCreate,
    MdExtension,
    MdOpenInNew,
    MdPerson,
    MdPersonAdd,
    MdStar,
    MdTag,
} from "react-icons/md";
import { UserInfoModel } from "../../models/account";
import { loc } from "../../util/localization";
import "./styles/index.scss";
import { NewGameDialog } from "./newGameDialog";
import { MinimalGame } from "../../models/game";
import { get, post } from "../../util/api";
import { useSnackbar } from "notistack";
import { InvitePlayerDialog } from "./invitePlayerDialog";

function GameCard(props: {
    game: MinimalGame;
    uid: string;
    invitePlayer: (game: MinimalGame) => void;
}) {
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
                    {uid === game.owner_id ? (
                        <Tooltip
                            title={loc("games.main.items.invite")}
                            disableInteractive
                        >
                            <IconButton
                                onClick={() => props.invitePlayer(props.game)}
                            >
                                <MdPersonAdd />
                            </IconButton>
                        </Tooltip>
                    ) : null}
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
    const [speedDialOpen, setSpeedDialOpen] = useState<boolean>(false);
    const [invitingGame, setInvitingGame] = useState<MinimalGame | null>(null);
    const [joiningGame, setJoiningGame] = useState<boolean>(false);
    const [joinCode, setJoinCode] = useState<string>("");

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
                <SpeedDial
                    color="primary"
                    ariaLabel="new game"
                    className="add-game-button"
                    icon={<MdAdd size={24} />}
                    open={speedDialOpen}
                    onClose={() => setSpeedDialOpen(false)}
                    onMouseEnter={() => setSpeedDialOpen(true)}
                >
                    <SpeedDialAction
                        key={"create"}
                        icon={<MdCreate size={20} />}
                        tooltipTitle={loc("games.main.speed_dial.create")}
                        onClick={() => {
                            setAddDialogOpen(true);
                            setSpeedDialOpen(false);
                        }}
                    />
                    <SpeedDialAction
                        key={"join"}
                        icon={<MdPersonAdd size={20} />}
                        tooltipTitle={loc("games.main.speed_dial.join")}
                        onClick={() => {
                            setJoinCode("");
                            setJoiningGame(true);
                        }}
                    />
                </SpeedDial>
                <div className="game-list">
                    {games.map((game: MinimalGame) => (
                        <GameCard
                            game={game}
                            uid={props.userInfo.userId}
                            key={game.id}
                            invitePlayer={(game: MinimalGame) =>
                                setInvitingGame(game)
                            }
                        />
                    ))}
                </div>
            </Box>
            <NewGameDialog
                open={addDialogOpen}
                setOpen={setAddDialogOpen}
                onCreate={loadGames}
            />
            <InvitePlayerDialog
                open={invitingGame !== null}
                handleClose={() => setInvitingGame(null)}
                game={invitingGame}
            ></InvitePlayerDialog>
            <Dialog open={joiningGame} onClose={() => setJoiningGame(false)}>
                <DialogTitle>{loc("games.main.join.title")}</DialogTitle>
                <DialogContent>
                    <TextField
                        sx={{ marginTop: "10px" }}
                        value={joinCode}
                        onChange={(event) => setJoinCode(event.target.value)}
                        variant="outlined"
                        label={loc("games.main.join.input")}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position={"start"}>
                                    <MdTag size={24} />
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={() => setJoiningGame(false)}
                    >
                        {loc("generic.cancel")}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            post<null>(
                                `/games/join/${
                                    joinCode.length > 0 ? joinCode : "nocode"
                                }`
                            ).then((result) => {
                                setJoiningGame(false);
                                setJoinCode("");
                                if (result.success) {
                                    enqueueSnackbar(
                                        loc("games.main.join.success"),
                                        {
                                            autoHideDuration: 3000,
                                            variant: "success",
                                        }
                                    );
                                    loadGames();
                                } else {
                                    enqueueSnackbar(result.message, {
                                        autoHideDuration: 3000,
                                        variant: "error",
                                    });
                                }
                            });
                        }}
                    >
                        {loc("games.main.join.submit")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
