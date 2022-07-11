import { AppBar, Button, Container, Toolbar, Typography } from "@mui/material";
import React from "react";
import { MdBubbleChart } from "react-icons/md";

export function Layout() {
    return (
        <AppBar position="absolute">
            <Container maxWidth={false}>
                <Toolbar disableGutters>
                    <MdBubbleChart size="36px" />
                    <Typography fontSize={"20px"} marginLeft={"10px"}>
                        Tools
                    </Typography>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
