import { AppBar, Container, Toolbar, Typography } from "@mui/material";
import React from "react";
import { MdBubbleChart } from "react-icons/md";
import { Outlet } from "react-router-dom";
import "./style.scss";

export function Layout(props: { showControls?: boolean }) {
    return (
        <>
            <AppBar position="absolute" className="root-nav">
                <Container maxWidth={false}>
                    <Toolbar disableGutters>
                        <MdBubbleChart size="36px" />
                        <Typography fontSize={"20px"} marginLeft={"10px"}>
                            TTRPG Kit
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