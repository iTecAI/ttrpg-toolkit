import {
    AppBar,
    InputAdornment,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { Box } from "@mui/system";

import "./index.scss";
import { MdGridView, MdSearch, MdViewList } from "react-icons/md";
import { useEffect, useState } from "react";
import { loc } from "../../util/localization";
import { GridView } from "./gridview";

type ViewMode = "grid" | "list";

export function ContentPage() {
    const [vMode, setVMode] = useState<ViewMode>("grid");
    const [search, setSearch] = useState<string>("");

    return (
        <Box className="content-page">
            <AppBar className="top-bar" elevation={0}>
                <Box className="contents">
                    <TextField
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MdSearch size={24} />
                                </InputAdornment>
                            ),
                        }}
                        className={"search"}
                        label={loc("content.toolbar.search")}
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <ToggleButtonGroup
                        className="view-mode"
                        value={vMode}
                        onChange={(event, value) => setVMode(value)}
                        exclusive
                    >
                        <ToggleButton value="grid">
                            <MdGridView size={24} />
                        </ToggleButton>
                        <ToggleButton value="list">
                            <MdViewList size={24} />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </AppBar>
            <Box className="view-area">
                {vMode === "grid" ? <GridView search={search} /> : <></>}
            </Box>
        </Box>
    );
}
