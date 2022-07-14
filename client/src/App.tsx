import { Box, ThemeProvider } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
    BrowserRouter,
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { UserInfoModel } from "./models/account";
import { Layout } from "./pages/layout/Layout";
import { Login } from "./pages/login/Login";
import { themeOptionsDefault } from "./theme/default";
import { get } from "./util/api";

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
                <Route index element={<></>} />
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

function App() {
    return (
        <ThemeProvider theme={themeOptionsDefault}>
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
        </ThemeProvider>
    );
}

export default App;
