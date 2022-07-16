import {
    AppBar,
    Avatar,
    Button,
    CircularProgress,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    InputAdornment,
    DialogActions,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
    MdBubbleChart,
    MdEdit,
    MdFolder,
    MdGroup,
    MdLibraryBooks,
    MdLogin,
} from "react-icons/md";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { UserInfoModel } from "../../models/account";
import { post } from "../../util/api";
import { calculateGravatar } from "../../util/gravatar";
import { loc } from "../../util/localization";
import "./style.scss";

function UserSettingsDialog(props: {
    open: boolean;
    handleClose: () => void;
    userInfo: UserInfoModel;
}) {
    const [displayName, setDisplayName] = useState<string>(
        props.userInfo.displayName
    );

    useEffect(() => {
        if (props.open === true) {
            setDisplayName(props.userInfo.displayName);
        }
    }, [props.open, props.userInfo.displayName]);

    return (
        <Dialog fullWidth open={props.open} onClose={props.handleClose}>
            <DialogTitle>{loc("layout.user_settings.title")}</DialogTitle>
            <DialogContent>
                <TextField
                    variant="filled"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <MdEdit size={20} />
                            </InputAdornment>
                        ),
                    }}
                    label={loc("layout.user_settings.name")}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={props.handleClose}>
                    {loc("generic.cancel")}
                </Button>
                <Button
                    variant="contained"
                    onClick={() =>
                        post<null>("/account/edit", {
                            body: { displayName: displayName },
                        }).then(props.handleClose)
                    }
                >
                    {loc("generic.submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function Layout(props: {
    loggedIn: boolean;
    userInfo: UserInfoModel | null;
    loading: boolean;
}) {
    const nav = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [userSettingsOpen, setUserSettingsOpen] = useState<boolean>(false);
    const userMenuOpen = Boolean(anchorEl);

    const location = useLocation();

    return (
        <>
            <AppBar position="absolute" className="root-nav">
                <Container maxWidth={false}>
                    <Toolbar disableGutters>
                        <MdBubbleChart
                            size="36px"
                            onClick={() => nav("/")}
                            className="title-icon"
                        />
                        <Typography
                            fontSize={"20px"}
                            marginLeft={"10px"}
                            className="noselect title"
                            onClick={() => nav("/")}
                        >
                            {loc("layout.title")}
                        </Typography>
                        {props.loading ? (
                            <CircularProgress
                                className="user-info-loading"
                                size="32px"
                            />
                        ) : props.loggedIn ? (
                            <>
                                <Stack
                                    className="nav-buttons"
                                    direction={"row"}
                                    spacing={1}
                                >
                                    <Button
                                        sx={{
                                            color: location.pathname.includes(
                                                "/games"
                                            )
                                                ? "primary"
                                                : "contrastText.background",
                                            borderBottomStyle: "solid",
                                            borderBottomColor: "primary",
                                            borderBottomWidth:
                                                location.pathname.includes(
                                                    "/games"
                                                )
                                                    ? "2px"
                                                    : "0px",
                                        }}
                                        size="large"
                                        onClick={() => nav("/games")}
                                    >
                                        {loc("layout.buttons.games")}
                                    </Button>
                                    <Button
                                        sx={{
                                            color: location.pathname.includes(
                                                "/collections"
                                            )
                                                ? "primary"
                                                : "contrastText.background",
                                            borderBottomStyle: "solid",
                                            borderBottomColor: "primary",
                                            borderBottomWidth:
                                                location.pathname.includes(
                                                    "/collections"
                                                )
                                                    ? "2px"
                                                    : "0px",
                                        }}
                                        size="large"
                                    >
                                        {loc("layout.buttons.collections")}
                                    </Button>
                                    <Button
                                        sx={{
                                            color: location.pathname.includes(
                                                "/compendium"
                                            )
                                                ? "primary"
                                                : "contrastText.background",
                                            borderBottomStyle: "solid",
                                            borderBottomColor: "primary",
                                            borderBottomWidth:
                                                location.pathname.includes(
                                                    "/compendium"
                                                )
                                                    ? "2px"
                                                    : "0px",
                                        }}
                                        size="large"
                                    >
                                        {loc("layout.buttons.compendium")}
                                    </Button>
                                </Stack>
                                <IconButton
                                    onClick={(
                                        event: React.MouseEvent<HTMLElement>
                                    ) => {
                                        setAnchorEl(event.currentTarget);
                                    }}
                                    className="user-icon"
                                >
                                    <Avatar
                                        alt={loc("layout.user_icon_alt")}
                                        src={calculateGravatar(
                                            props.userInfo &&
                                                props.userInfo.username
                                                ? props.userInfo.username
                                                : "noemail"
                                        )}
                                    />
                                </IconButton>

                                <Menu
                                    id="user-menu"
                                    anchorEl={anchorEl}
                                    open={userMenuOpen}
                                    onClose={() => setAnchorEl(null)}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            setUserSettingsOpen(true);
                                            setAnchorEl(null);
                                        }}
                                    >
                                        {loc("layout.user_menu.settings")}
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            setAnchorEl(null);
                                            post<null>("/account/logout").then(
                                                (result) => {
                                                    if (result.success) {
                                                        nav("/");
                                                    }
                                                }
                                            );
                                        }}
                                    >
                                        {loc("layout.user_menu.logout")}
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : window.location.pathname !== "/login" ? (
                            <Button
                                variant="outlined"
                                className="login-btn"
                                startIcon={<MdLogin />}
                                onClick={() => nav("/login")}
                            >
                                {loc("layout.login")}
                            </Button>
                        ) : (
                            <></>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
            <div className="content-area">
                <Outlet />
            </div>
            <UserSettingsDialog
                open={userSettingsOpen}
                handleClose={() => setUserSettingsOpen(false)}
                userInfo={
                    props.userInfo || {
                        userId: "",
                        username: "",
                        displayName: "",
                    }
                }
            />
        </>
    );
}
