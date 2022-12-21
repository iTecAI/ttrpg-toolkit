import { Autocomplete, Container, Paper, TextField } from "@mui/material";
import { ModularRenderer } from "../../libs/modular-renderer";
import formSchema from "./form-playground.renderer.json";
import { useState } from "react";

export function Playground() {
    const [form, setForm] = useState<any>({
        name: "test",
        chips: "test1,test2,test3",
        "chip-select": [],
        "chip-auto": [],
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
            <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={["test1", "testNo"]}
                sx={{ width: 300 }}
                renderInput={(params) => (
                    <TextField {...params} label="Movie" />
                )}
            />
        </Container>
    );
}
