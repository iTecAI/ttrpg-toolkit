import { createTheme, ThemeOptions } from "@mui/material";

declare module "@mui/material/styles" {
    interface Palette {
        contrastText?: {
            primary?: string;
            secondary?: string;
            background?: string;
        };
    }

    // allow configuration using `createTheme`
    interface PaletteOptions {
        contrastText?: {
            primary?: string;
            secondary?: string;
            background?: string;
        };
    }
}

export const themeOptionsDefault: ThemeOptions = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#c997e4",
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
        contrastText: {
            primary: "#ffffff",
            secondary: "#ffffff",
            background: "#ffffff",
        },
    },
});
