import { createTheme, ThemeOptions } from "@mui/material";

export const themeOptionsDefault: ThemeOptions = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#9e6fb7",
        },
        secondary: {
            main: "#ff3d00",
        },
        background: {
            default: "#232323",
            paper: "#2f2f2f",
        },
        error: {
            main: "#f44336",
        },
    },
});
