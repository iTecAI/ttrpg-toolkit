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
} from "@mui/material";
import React, { useState } from "react";
import { MdBubbleChart, MdLogin } from "react-icons/md";
import { Outlet, useNavigate } from "react-router-dom";
import { UserInfoModel } from "../../models/account";
import { post } from "../../util/api";
import { calculateGravatar } from "../../util/gravatar";
import { loc } from "../../util/localization";
import "./style.scss";

export function Layout(props: {
    loggedIn: boolean;
    userInfo: UserInfoModel | null;
    loading: boolean;
}) {
    const nav = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const userMenuOpen = Boolean(anchorEl);

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
        </>
    );
}
