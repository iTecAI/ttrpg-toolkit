import { Box, ThemeProvider } from "@mui/material";
import { SnackbarProvider, useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import {
    BrowserRouter,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { UserInfoModel } from "./models/account";
import { RootModel } from "./models/root";
import { Compendium } from "./pages/compendium/compendium";
import { GamesListPage } from "./pages/games/gamesIndex";
import { Index } from "./pages/index/Index";
import { Layout } from "./pages/layout/Layout";
import { Login } from "./pages/login/Login";
import { themeOptionsDefault } from "./theme/default";
import { get } from "./util/api";
import { loc } from "./util/localization";

export const RootContext: React.Context<{} | RootModel> = React.createContext(
    {}
);

function RouterChild() {
    const [userInfo, setUserInfo] = useState<UserInfoModel | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    let location = useLocation();
    let nav = useNavigate();

    useEffect(() => {
        get<UserInfoModel>("/account").then((result) => {
            if (loading) {
                setLoading(false);
            }
            if (result.success) {
                setUserInfo(result.value);
                if (!loggedIn) {
                    setLoggedIn(true);
                }
            } else {
                if (loggedIn) {
                    setLoggedIn(false);
                    setUserInfo(null);
                }
                if (!["/", "/login"].includes(window.location.pathname)) {
                    nav("/");
                }
            }
        });
    }, [location, nav, loggedIn, loading]);

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Layout
                        loggedIn={loggedIn}
                        userInfo={userInfo}
                        loading={loading}
                    />
                }
            >
                <Route index element={<Index />} />
                <Route
                    path="/games"
                    element={
                        <GamesListPage
                            userInfo={
                                userInfo || {
                                    userId: "",
                                    username: "",
                                    displayName: "",
                                }
                            }
                        />
                    }
                />
                <Route path="/compendium" element={<Compendium />} />
            </Route>
            <Route
                path="/login"
                element={
                    <Layout
                        loggedIn={loggedIn}
                        userInfo={userInfo}
                        loading={loading}
                    />
                }
            >
                <Route index element={<Login />} />
            </Route>
        </Routes>
    );
}

function RootContextProvider() {
    const [currentRoot, setCurrentRoot] = useState<{} | RootModel>({});

    const { enqueueSnackbar } = useSnackbar();
    useEffect(() => {
        get<RootModel>("/").then((result) => {
            if (result.success) {
                setCurrentRoot(result.value);
            } else {
                enqueueSnackbar(loc("error.connection"), {
                    autoHideDuration: 5000,
                    variant: "error",
                });
            }
        });
    }, [enqueueSnackbar]);

    return (
        <RootContext.Provider value={currentRoot}>
            <Box
                sx={{
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "background.default",
                    display: "inline-block",
                }}
            >
                <BrowserRouter>
                    <RouterChild />
                </BrowserRouter>
            </Box>
        </RootContext.Provider>
    );
}

function App() {
    return (
        <ThemeProvider theme={themeOptionsDefault}>
            <SnackbarProvider maxSnack={3}>
                <RootContextProvider />
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default App;
