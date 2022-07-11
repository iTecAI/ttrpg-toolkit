import {
    Button,
    Card,
    CardContent,
    CardHeader,
    InputAdornment,
    Stack,
    TextField,
} from "@mui/material";
import React, { useState } from "react";
import {
    MdAccountCircle,
    MdAlternateEmail,
    MdLogin,
    MdPassword,
} from "react-icons/md";
import "./style.scss";

type loginMode = "login" | "signup";
type loginStatus = null | "error" | "working" | "success";
type formProps = {
    setMode: (mode: loginMode) => void;
    status: loginStatus;
    setStatus: (status: loginStatus) => void;
};

function LoginForm(props: formProps) {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    return (
        <Card className="login-form">
            <CardHeader
                title="Sign In to TTRPG Kit"
                subheader="Enter account details below"
                avatar={<MdLogin size={28} className="header-icon" />}
            />
            <CardContent>
                <Stack spacing={2}>
                    <TextField
                        label="Email"
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
                        label="Password"
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
                    <Stack
                        direction={"row"}
                        spacing={2}
                        className="button-panel"
                    >
                        <Button
                            variant="outlined"
                            onClick={() => props.setMode("signup")}
                        >
                            Create Account
                        </Button>
                        <Button variant="contained">Login</Button>
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

    return (
        <Card className="login-form">
            <CardHeader
                title="Create TTRPG Kit Account"
                subheader="Enter account details below"
                avatar={<MdAccountCircle size={28} className="header-icon" />}
            />
            <CardContent>
                <Stack spacing={2}>
                    <TextField
                        label="Email"
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
                        label="Password"
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
                        label="Confirm Password"
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
                    <Stack
                        direction={"row"}
                        spacing={2}
                        className="button-panel"
                    >
                        <Button
                            variant="outlined"
                            onClick={() => props.setMode("login")}
                        >
                            Use Existing Account
                        </Button>
                        <Button variant="contained">Create Account</Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export function Login() {
    const [mode, setMode] = useState("login" as loginMode);
    const [status, setStatus] = useState(null as loginStatus);

    return (
        <div className="login-wrapper">
            <img
                className="login-backdrop"
                alt="Login backdrop"
                src="assets/login-wallpaper.jpg"
            />

            {mode === "login" ? (
                <LoginForm
                    setMode={setMode}
                    status={status}
                    setStatus={setStatus}
                />
            ) : (
                <CreateAccountForm
                    setMode={setMode}
                    status={status}
                    setStatus={setStatus}
                />
            )}
        </div>
    );
}
