import { Container, Paper } from "@mui/material";
import { ModularRenderer } from "../../libs/modular-renderer";
import formSchema from "./form-playground.renderer.json";
import { useState } from "react";

export function Playground() {
    const [form, setForm] = useState<any>({
        name: "test",
        chips: "test1,test2,test3",
        "chip-select": [],
        age: 100,
    });
    return (
        <Container>
            <ModularRenderer
                id="playground-render"
                renderer={formSchema as any}
                data={{}}
                formData={form}
                onFormDataChange={(data) => setForm(data)}
            />
            <Paper>{JSON.stringify(form)}</Paper>
        </Container>
    );
}
