import { Box, Button, ThemeProvider } from "@mui/material";
import { SnackbarProvider, useSnackbar } from "notistack";
import React, { useContext, useEffect, useReducer, useState } from "react";
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
import { UpdateType } from "./util/updates";
import { DialogProvider } from "./util/DialogContext";
import { ContentPage } from "./pages/content";
export const RootContext: React.Context<{} | RootModel> = React.createContext(
    {}
);

export type UpdateContextType =
    | {
          active: false;
      }
    | {
          active: true;
          events: UpdateType[];
          pop: (type: string) => UpdateType[];
      };

export type UpdateContextAction =
    | {
          type: "activate";
          sessionId: string;
      }
    | {
          type: "deactivate";
      }
    | {
          type: "push";
          updates: UpdateType[];
      }
    | {
          type: "set";
          newUpdates: UpdateType[];
      };

export const UpdateContext: React.Context<
    [UpdateContextType, React.Dispatch<UpdateContextAction>]
> = React.createContext<
    [UpdateContextType, React.Dispatch<UpdateContextAction>]
>([
    {
        active: false,
    },
    (value: UpdateContextAction) => {},
]);

export const UserContext: React.Context<UserInfoModel | null> =
    React.createContext<UserInfoModel | null>(null);

/**
 * Router Setup
 * @returns JSX.Element
 */
function RouterChild() {
    const [userInfo, setUserInfo] = useState<UserInfoModel | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    let location = useLocation();
    let nav = useNavigate();
    let [updates, dispatch] = useContext(UpdateContext);

    useEffect(() => {
        get<UserInfoModel>("/account").then((result) => {
            if (loading) {
                setLoading(false);
            }
            if (result.success) {
                setUserInfo(result.value);
                if (!updates.active) {
                    dispatch({
                        type: "activate",
                        sessionId: localStorage.getItem("sessionId") ?? "",
                    });
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
        <UserContext.Provider value={userInfo}>
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
                    <Route path="/content" element={<ContentPage />} />
                    <Route
                        path="/content/:type/:id"
                        element={<ContentPage />}
                    />
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
        </UserContext.Provider>
    );
}

/**
 * Provides RootContext
 * @param props Children nodes
 * @returns JSX.Element
 */
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

/**
 * Handles EventSource context
 * @returns JSX.Element
 */
function UpdateContextProvider(): JSX.Element {
    const [source, setSource] = useState<EventSource | null>(null);

    function buildActiveState(events: UpdateType[]): UpdateContextType {
        return {
            active: true,
            events: events,
            pop: (type: string) => {
                const result = events.filter((v) => v.event === type);
                if (result.length > 0) {
                    dispatchCtx({
                        type: "set",
                        newUpdates: events.filter((v) => v.event !== type),
                    });
                }

                return result;
            },
        };
    }

    function ctxReducer(
        state: UpdateContextType,
        action: UpdateContextAction
    ): UpdateContextType {
        switch (action.type) {
            case "activate":
                if (source) {
                    return state;
                }
                const src = new EventSource(
                    `/api/updates/poll/${action.sessionId}`,
                    {
                        withCredentials: true,
                    }
                );
                src.addEventListener("message", (ev: MessageEvent<string>) => {
                    const data: UpdateType[] = JSON.parse(ev.data);
                    if (data.length > 0) {
                        dispatchCtx({ type: "push", updates: data });
                    }
                });
                setSource(src);
                return buildActiveState([]);
            case "deactivate":
                if (source && source.readyState !== 2) {
                    source.close();
                }
                return {
                    active: false,
                };
            case "push":
                if (state.active) {
                    let currentEvents = state.events;
                    currentEvents.unshift(
                        ...action.updates.filter(
                            (u) =>
                                currentEvents.filter(
                                    (c) => c.dispatched === u.dispatched
                                ).length === 0
                        )
                    );
                    return buildActiveState(currentEvents);
                } else {
                    console.error("Attempted push on inactive state.");
                    return { active: false };
                }
            case "set":
                if (state.active) {
                    return buildActiveState(action.newUpdates);
                } else {
                    console.error("Attempted set on inactive state.");
                    return { active: false };
                }
        }
    }

    const [ctx, dispatchCtx] = useReducer(ctxReducer, { active: false });

    useEffect(() => {
        window.addEventListener("unload", () => {
            del<null>("/updates/poll").then(console.log);
        });
    }, [source]);

    return (
        <UpdateContext.Provider value={[ctx, dispatchCtx]}>
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

/**
 * Root App component
 * @returns JSX.Element
 */
function App() {
    return (
        <ThemeProvider theme={themeOptionsDefault}>
            <SnackbarProvider maxSnack={5}>
                <DialogProvider>
                    <RootContextProvider>
                        <UpdateContextProvider />
                    </RootContextProvider>
                </DialogProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default App;
