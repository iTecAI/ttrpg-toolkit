import { Stack } from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import { RenderStackItem } from "../types/renderTypes";
import { expandItems } from "../utility/parsers";
import RenderItem from "../RenderItem";

export const StackItem: RendererFunction<RenderStackItem> = (
    props: RendererFunctionProps<RenderStackItem>
) => {
    const { renderer, data, formData } = props;
    const direction = renderer.direction ?? "horizontal";
    const spacing = renderer.spacing ?? 2;
    const children = renderer.children ?? [];
    const childrenExp = expandItems(children, data, formData);
    return (
        <Stack
            className={
                "render-item child stack" +
                (direction === "horizontal" ? " row" : " column")
            }
            direction={direction === "horizontal" ? "row" : "column"}
            spacing={spacing}
            sx={{
                "& > *": {
                    width:
                        direction === "horizontal"
                            ? `calc(100% / ${
                                  childrenExp.filter((c) => c !== null).length
                              })`
                            : undefined,
                },
            }}
        >
            <RenderItem
                renderer={children}
                dataOverride={data}
                formDataOverride={formData}
            />
        </Stack>
    );
};
