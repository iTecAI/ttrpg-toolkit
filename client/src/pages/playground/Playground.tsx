import { Container, Typography } from "@mui/material";
import { ModularRenderer, MuiRenderParser } from "../../libs/modoc";
import { loc } from "../../util/localization";
import formSchema from "./form-playground.renderer.json";

export function Playground() {
    return (
        <Container>
            <ModularRenderer
                data={{}}
                renderer={formSchema as any}
                parser={MuiRenderParser}
            />
        </Container>
    );
}
