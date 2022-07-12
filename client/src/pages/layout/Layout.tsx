import {
    AppBar,
    Avatar,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdBubbleChart } from "react-icons/md";
import { Outlet, useNavigate } from "react-router-dom";
import { UserInfoModel } from "../../models/account";
import { get, post } from "../../util/api";
import { calculateGravatar } from "../../util/gravatar";
import { loc } from "../../util/localization";
import "./style.scss";

export function Layout(props: {
    showControls?: boolean;
    verifyCredentials?: boolean;
}) {
    const nav = useNavigate();
    const [userInfo, setUserInfo] = useState<UserInfoModel>({
        userId: "",
        username: "",
    });
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const userMenuOpen = Boolean(anchorEl);

    useEffect(() => {
        if (props.verifyCredentials) {
            get<UserInfoModel>("/account").then((result) => {
                if (result.success) {
                    setUserInfo(result.value);
                } else {
                    nav("/login");
                }
            });
        }
    }, [props.verifyCredentials, nav]);

    return (
        <>
            <AppBar position="absolute" className="root-nav">
                <Container maxWidth={false}>
                    <Toolbar disableGutters>
                        <MdBubbleChart size="36px" />
                        <Typography
                            fontSize={"20px"}
                            marginLeft={"10px"}
                            className="noselect"
                        >
                            {loc("layout.title")}
                        </Typography>
                        {props.showControls ? (
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
                                            userInfo.username || "noemail"
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
                                                        nav("/login");
                                                    }
                                                }
                                            );
                                        }}
                                    >
                                        {loc("layout.user_menu.logout")}
                                    </MenuItem>
                                </Menu>
                            </>
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
