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
import { MdAlternateEmail, MdLogin, MdPassword } from "react-icons/md";
import "./style.scss";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    return (
        <Card className="login-form">
            <CardHeader
                title="Sign In to TTRPG Kit"
                subheader="Enter login details below"
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
                        <Button variant="outlined">Create Account</Button>
                        <Button variant="contained">Login</Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

type loginMode = "login" | "signup";
type loginStatus = null | "error" | "working" | "success";

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

            {mode === "login" ? <LoginForm /> : <></>}
        </div>
    );
}
