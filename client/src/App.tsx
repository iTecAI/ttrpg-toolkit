import { Box, Button, ThemeProvider } from "@mui/material";
import { SnackbarProvider, useSnackbar } from "notistack";
import React, { useContext, useEffect, useState } from "react";
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
import { del, get } from "./util/api";
import { loc } from "./util/localization";
import { Playground } from "./pages/playground/Playground";
import { Collections } from "./pages/collections";
import { UpdateType } from "./util/updates";
export const RootContext: React.Context<{} | RootModel> = React.createContext(
    {}
);

export type UpdateContextType =
    | {
          active: false;
          activate: (session: string) => void;
      }
    | {
          active: true;
          deactivate: () => void;
          events: UpdateType[];
          pop: (type: string) => UpdateType[];
      };

export const UpdateContext: React.Context<UpdateContextType> =
    React.createContext<UpdateContextType>({
        active: false,
        activate(session) {},
    });

function RouterChild() {
    const [userInfo, setUserInfo] = useState<UserInfoModel | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    let location = useLocation();
    let nav = useNavigate();
    let updates = useContext(UpdateContext);

    useEffect(() => {
        get<UserInfoModel>("/account").then((result) => {
            if (loading) {
                setLoading(false);
            }
            if (result.success) {
                setUserInfo(result.value);
                if (!updates.active) {
                    updates.activate(localStorage.getItem("sessionId") ?? "");
                }
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
                <Route path="/playground" element={<Playground />} />
                <Route path="/collections" element={<Collections />} />
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

function RootContextProvider(props: { children: React.ReactNode }) {
    const [currentRoot, setCurrentRoot] = useState<{} | RootModel>({});

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    useEffect(() => {
        get<RootModel>("/").then((result) => {
            if (result.success) {
                setCurrentRoot(result.value);
            } else {
                enqueueSnackbar(loc("error.connection"), {
                    action: (snackbarId) => (
                        <Button
                            variant="text"
                            onClick={() => closeSnackbar(snackbarId)}
                        >
                            {loc("generic.dismiss")}
                        </Button>
                    ),
                    variant: "error",
                });
            }
        });
    }, [enqueueSnackbar, closeSnackbar]);

    return (
        <RootContext.Provider value={currentRoot}>
            {props.children}
        </RootContext.Provider>
    );
}

function UpdateContextProvider(): JSX.Element {
    const [events, setEvents] = useState<UpdateType[]>([]);
    const [source, setSource] = useState<EventSource | null>(null);
    const [ctx, setCtx] = useState<UpdateContextType>({
        active: false,
        activate,
    });

    useEffect(() => {
        window.addEventListener("unload", () => {
            del<null>("/updates/poll").then(console.log);
        });
    }, [source]);

    function deactivate() {
        setCtx({
            active: false,
            activate,
        });
        if (source) {
            source.close();
        }
        setEvents([]);
    }

    function updateCtx(newEvents: UpdateType[]) {
        if (ctx.active) {
            setCtx({
                active: true,
                deactivate,
                events,
                pop: (type: string) => {
                    const results = events.filter((v) => v.event === type);
                    const newEvents = events.filter((v) => v.event !== type);
                    setEvents(newEvents);
                    return results;
                },
            });
        }
    }

    function activate(sessionId: string) {
        if (ctx.active) {
            return;
        }
        setEvents([]);
        const src = new EventSource(`/api/updates/poll/${sessionId}`, {
            withCredentials: true,
        });
        src.addEventListener("message", (ev: MessageEvent<string>) => {
            const data: UpdateType[] = JSON.parse(ev.data);
            console.log(data);
            if (data.length > 0) {
                events.unshift(...data);
                setEvents(events);
                console.log(events);
                updateCtx(events);
            }
        });
        src.addEventListener("error", console.log);
        setSource(src);
        setCtx({
            active: true,
            deactivate,
            events,
            pop: (type: string) => {
                const results = events.filter((v) => v.event === type);
                const newEvents = events.filter((v) => v.event !== type);
                setEvents(newEvents);
                return results;
            },
        });
    }

    return (
        <UpdateContext.Provider value={ctx}>
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
        </UpdateContext.Provider>
    );
}

function App() {
    return (
        <ThemeProvider theme={themeOptionsDefault}>
            <SnackbarProvider maxSnack={5}>
                <RootContextProvider>
                    <UpdateContextProvider />
                </RootContextProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default App;
