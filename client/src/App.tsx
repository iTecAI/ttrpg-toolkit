import { Box, ThemeProvider } from "@mui/material";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./pages/layout/Layout";
import { themeOptionsDefault } from "./theme/default";

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
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<></>} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </Box>
        </ThemeProvider>
    );
}

export default App;
