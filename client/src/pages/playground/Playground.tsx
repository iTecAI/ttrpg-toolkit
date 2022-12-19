import { Container, Typography } from "@mui/material";
import { ModularRenderer } from "../../libs/modular-renderer";
import { loc } from "../../util/localization";
import formSchema from "./form-playground.renderer.json";
import { useState } from "react";

export function Playground() {
    const [form, setForm] = useState<any>({ test: "" });
    return (
        <Container>
            <ModularRenderer
                id="playground-render"
                renderer={formSchema as any}
                data={{}}
                formData={form}
                onFormDataChange={(data) => setForm(data)}
            />
        </Container>
    );
}
