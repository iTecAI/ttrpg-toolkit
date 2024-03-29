import { Chip } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import { RenderChipItem } from "../types/renderTypes";
import { ModularAvatar } from "./common";
import { useValueItem } from "../utility/hooks";

export const ChipItem: RendererFunction<RenderChipItem> = (
    props: RendererFunctionProps<RenderChipItem>
) => {
    const { renderer, data } = props;
    const text = useValueItem(renderer.text ?? "", data);
    const filled = renderer.filled ?? true;
    const avatar = renderer.avatar && <ModularAvatar item={renderer.avatar} />;
    return (
        <Chip
            className="render-item child chip"
            variant={filled ? "filled" : "outlined"}
            label={typeof text === "string" ? text : JSON.stringify(text)}
            avatar={avatar}
        />
    );
};
