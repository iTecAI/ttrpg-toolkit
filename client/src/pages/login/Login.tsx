import { LoadingButton } from "@mui/lab";
import { loc } from "../../util/localization";
import {
    Alert,
    Button,
    Card,
    CardContent,
    CardHeader,
    InputAdornment,
    Stack,
    TextField,
} from "@mui/material";
import React, { useContext, useState } from "react";
import {
    MdAccountCircle,
    MdAlternateEmail,
    MdLogin,
    MdPassword,
} from "react-icons/md";
import "./style.scss";
import { isValidEmail } from "../../util/validators";
import { ApiResponse, post } from "../../util/api";
import { SessionModel } from "../../models/account";
import { useNavigate } from "react-router-dom";
import { UpdateContext } from "../../App";

type loginMode = "login" | "signup";
type loginStatus = null | "error" | "working" | "success";
type formProps = {
    setMode: (mode: loginMode) => void;
    status: loginStatus;
    setStatus: (status: loginStatus) => void;
    statusText: string;
    setStatusText: (statusText: string) => void;
};

function LoginForm(props: formProps) {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    const nav = useNavigate();
    const updates = useContext(UpdateContext);

    return (
        <Card className="login-form">
            <CardHeader
                title={loc("login.signin.header")}
                subheader={loc("login.subheader")}
                avatar={<MdLogin size={28} className="header-icon" />}
                className="noselect"
            />
            <CardContent>
                <Stack spacing={2}>
                    <TextField
                        label={loc("login.email")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdAlternateEmail />
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                    />
                    <TextField
                        label={loc("login.password")}
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        placeholder="••••••••"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdPassword />
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                        type="password"
                    />
                    {props.status === "error" || props.status === "success" ? (
                        <Alert severity={props.status}>
                            {props.statusText}
                        </Alert>
                    ) : (
                        <></>
                    )}
                    <Stack
                        direction={"row"}
                        spacing={2}
                        className="button-panel"
                    >
                        <Button
                            variant="outlined"
                            onClick={() => {
                                props.setMode("signup");
                                props.setStatus(null);
                            }}
                        >
                            {loc("login.signin.switch")}
                        </Button>
                        <LoadingButton
                            variant="contained"
                            loading={props.status === "working"}
                            onClick={() => {
                                if (email.length === 0) {
                                    props.setStatus("error");
                                    props.setStatusText(
                                        loc("error.validation.emptyField", {
                                            fieldName: "Email",
                                        })
                                    );
                                    return;
                                }
                                if (pass.length === 0) {
                                    props.setStatus("error");
                                    props.setStatusText(
                                        loc("error.validation.emptyField", {
                                            fieldName: "Password",
                                        })
                                    );
                                    return;
                                }
                                if (!isValidEmail(email)) {
                                    props.setStatus("error");
                                    props.setStatusText(
                                        loc("error.validation.invalidField", {
                                            value: email,
                                            type: "email",
                                        })
                                    );
                                    return;
                                }
                                props.setStatus("working");
                                post<SessionModel>("/account", {
                                    body: { username: email, password: pass },
                                }).then((result: ApiResponse<SessionModel>) => {
                                    if (result.success) {
                                        props.setStatus("success");
                                        props.setStatusText(
                                            loc("login.signin.success")
                                        );
                                        window.localStorage.setItem(
                                            "sessionId",
                                            result.value.sessionId
                                        );
                                        nav("/");
                                    } else {
                                        props.setStatus("error");
                                        props.setStatusText(result.message);
                                    }
                                });
                            }}
                        >
                            {loc("login.signin.submit")}
                        </LoadingButton>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

function CreateAccountForm(props: formProps) {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [passConfirm, setPassConfirm] = useState("");

    const nav = useNavigate();
    const updates = useContext(UpdateContext);

    return (
        <Card className="login-form">
            <CardHeader
                title={loc("login.signup.header")}
                subheader={loc("login.subheader")}
                avatar={<MdAccountCircle size={28} className="header-icon" />}
                className="noselect"
            />
            <CardContent>
                <Stack spacing={2}>
                    <TextField
                        label={loc("login.email")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdAlternateEmail />
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                    />
                    <TextField
                        label={loc("login.password")}
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        placeholder="••••••••"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdPassword />
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                        type="password"
                    />
                    <TextField
                        label={loc("login.password_confirm")}
                        value={passConfirm}
                        onChange={(e) => setPassConfirm(e.target.value)}
                        placeholder="••••••••"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdPassword />
                                </InputAdornment>
                            ),
                        }}
                        fullWidth
                        type="password"
                    />
                    {props.status === "error" || props.status === "success" ? (
                        <Alert severity={props.status}>
                            {props.statusText}
                        </Alert>
                    ) : (
                        <></>
                    )}
                    <Stack
                        direction={"row"}
                        spacing={2}
                        className="button-panel"
                    >
                        <Button
                            variant="outlined"
                            onClick={() => {
                                props.setMode("login");
                                props.setStatus(null);
                            }}
                        >
                            {loc("login.signup.switch")}
                        </Button>
                        <LoadingButton
                            variant="contained"
                            loading={props.status === "working"}
                            onClick={() => {
                                if (email.length === 0) {
                                    props.setStatus("error");
                                    props.setStatusText(
                                        loc("error.validation.emptyField", {
                                            fieldName: "Email",
                                        })
                                    );
                                    return;
                                }
                                if (pass.length === 0) {
                                    props.setStatus("error");
                                    props.setStatusText(
                                        loc("error.validation.emptyField", {
                                            fieldName: "Password",
                                        })
                                    );
                                    return;
                                }
                                if (passConfirm.length === 0) {
                                    props.setStatus("error");
                                    props.setStatusText(
                                        loc("error.validation.emptyField", {
                                            fieldName: "Confirm Password",
                                        })
                                    );
                                    return;
                                }
                                if (!isValidEmail(email)) {
                                    props.setStatus("error");
                                    props.setStatusText(
                                        loc("error.validation.invalidField", {
                                            value: email,
                                            type: "email",
                                        })
                                    );
                                    return;
                                }

                                props.setStatus("working");
                                post<SessionModel>("/account/create", {
                                    body: { username: email, password: pass },
                                }).then((result: ApiResponse<SessionModel>) => {
                                    if (result.success) {
                                        props.setStatus("success");
                                        props.setStatusText(
                                            loc("login.signup.success")
                                        );
                                        window.localStorage.setItem(
                                            "sessionId",
                                            result.value.sessionId
                                        );

                                        nav("/");
                                    } else {
                                        props.setStatus("error");
                                        props.setStatusText(result.message);
                                    }
                                });
                            }}
                        >
                            {loc("login.signup.submit")}
                        </LoadingButton>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export function Login() {
    const [mode, setMode] = useState("login" as loginMode);
    const [status, setStatus] = useState(null as loginStatus);
    const [statusText, setStatusText] = useState("");

    return (
        <div className="login-wrapper">
            <img
                className="login-backdrop"
                alt={loc("login.bg_alt")}
                src="assets/login-wallpaper.jpg"
            />

            {mode === "login" ? (
                <LoginForm
                    setMode={setMode}
                    status={status}
                    setStatus={setStatus}
                    statusText={statusText}
                    setStatusText={setStatusText}
                />
            ) : (
                <CreateAccountForm
                    setMode={setMode}
                    status={status}
                    setStatus={setStatus}
                    statusText={statusText}
                    setStatusText={setStatusText}
                />
            )}
        </div>
    );
}
