import { Chip } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import { FormData } from "../types";
import { RenderChipItem } from "../types/renderTypes";
import { ModularAvatar } from "./common";
import { useValueItem } from "../utility/hooks";

export const ChipItem: RendererFunction<RenderChipItem> = (
    props: RendererFunctionProps<RenderChipItem>
) => {
    const { renderer, data, formData } = props;
    const text = useValueItem(renderer.text ?? "", data);
    const filled = renderer.filled ?? true;
    const avatar = renderer.avatar && <ModularAvatar item={renderer.avatar} />;
    console.log(text, renderer.text);
    return (
        <Chip
            className="render-item child chip"
            variant={filled ? "filled" : "outlined"}
            label={typeof text === "string" ? text : JSON.stringify(text)}
            avatar={avatar}
        />
    );
};
