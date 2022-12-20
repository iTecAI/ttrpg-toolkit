import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
} from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import RenderItem from "../RenderItem";
import { RenderAccordionItem } from "../types/renderTypes";
import { ModularAvatar } from "./common";
import { MdExpandMore } from "react-icons/md";
import { useValueItem } from "../utility/hooks";

export const AccordionItem: RendererFunction<RenderAccordionItem> = (
    props: RendererFunctionProps<RenderAccordionItem>
) => {
    const { renderer, data, formData } = props;
    const children = renderer.children ?? [];
    const text = useValueItem(renderer.text ?? "", data);
    const alwaysOpen = renderer.alwaysOpen ?? false;
    const icon = renderer.icon ? (
        <ModularAvatar item={renderer.icon} />
    ) : undefined;
    const maxHeight = renderer.maxHeight ?? undefined;
    return (
        <Accordion
            className="render-item child accordion"
            expanded={alwaysOpen === true ? true : undefined}
        >
            <AccordionSummary
                expandIcon={alwaysOpen === true ? null : <MdExpandMore />}
            >
                {icon ?? null}
                <Typography>{text}</Typography>
            </AccordionSummary>
            <AccordionDetails
                style={{
                    maxHeight:
                        maxHeight === undefined ? undefined : maxHeight + "px",
                    overflowY: "auto",
                }}
            >
                <RenderItem
                    renderer={children}
                    dataOverride={data}
                    formDataOverride={formData}
                />
            </AccordionDetails>
        </Accordion>
    );
};
