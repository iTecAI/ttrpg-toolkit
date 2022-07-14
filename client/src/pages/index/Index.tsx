import { Container, Typography } from "@mui/material";
import { loc } from "../../util/localization";
import "./style.scss";

export function Index() {
    return (
        <Container className="text-container">
            <Typography
                variant="h2"
                className="title"
                color="contrastText.background"
            >
                {loc("index.title")}
            </Typography>
            <Typography
                variant="body1"
                color={"contrastText.background"}
                className="description"
            >
                {loc("index.description")}
            </Typography>
        </Container>
    );
}
