import { AppBar, Container, Toolbar, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { MdBubbleChart } from "react-icons/md";
import { Outlet, useNavigate } from "react-router-dom";
import { UserInfoModel } from "../../models/account";
import { get } from "../../util/api";
import { loc } from "../../util/localization";
import "./style.scss";

export function Layout(props: {
    showControls?: boolean;
    verifyCredentials?: boolean;
}) {
    const nav = useNavigate();

    useEffect(() => {
        if (props.verifyCredentials) {
            get<UserInfoModel>("/account").then((result) => {
                if (result.success) {
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
                    </Toolbar>
                </Container>
            </AppBar>
            <div className="content-area">
                <Outlet />
            </div>
        </>
    );
}
