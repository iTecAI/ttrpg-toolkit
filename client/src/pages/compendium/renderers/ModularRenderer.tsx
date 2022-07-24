import { DataItem, IconProps, RenderText } from "../../../models/compendium";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { getNested, renderText } from "./renderUtils";
import AbstractIcon from "../../../util/AbstractIcon";
import { MdExpandMore } from "react-icons/md";
import { Box } from "@mui/system";
import { Masonry } from "@mui/lab";

type MarkdownRender = {
    type: "markdown";
    text_source: string;
    extra_variables?: { [key: string]: RenderText };
};

type ListItemSource = {
    type: "list";
    source: string;
    renderer: ModularRenderItem;
};

type ItemSource = ListItemSource;

type Section = {
    type: "section";
    canExpand?: boolean;
    defaultExpanded?: boolean;
    title: RenderText;
    subtitle?: RenderText;
    icon?: IconProps;
    items: ModularRenderItem[] | ItemSource;
    max_height?: number;
};

type Columns = {
    type: "columns";
    spacing?: number;
    items: ModularRenderItem[] | ItemSource;
};

type Container = {
    type: "container";
    variant: "elevation" | "outlined";
    title: RenderText;
    subtitle?: RenderText;
    icon?: IconProps;
    items: ModularRenderItem[] | ItemSource;
    max_height?: number;
};

type MasonryColumns = {
    type: "masonry";
    spacing?: number;
    columns: number;
    items: ModularRenderItem[] | ItemSource;
};

type DividerItem = {
    type: "divider";
    variant?: "fullWidth" | "middle";
    text?: RenderText;
};

type ChipItem = {
    type: "chip";
    icon?: IconProps;
    text: RenderText;
};

export type ModularRenderItem =
    | MarkdownRender
    | Section
    | Columns
    | Container
    | MasonryColumns
    | DividerItem
    | ChipItem;

export default function ModularRenderer(props: {
    data: DataItem;
    item: ModularRenderItem;
}) {
    const { data, item } = props;
    let internalComponent: React.ReactNode;
    const [exp, setExp] = useState<boolean>(
        item.type === "section" ? item.defaultExpanded ?? false : false
    );

    let items: React.ReactNode[];
    if (Object.keys(item).includes("items")) {
        items = [];
        if (
            ((item as Section).items as ModularRenderItem[]).push === undefined
        ) {
            let sourceItem: ItemSource = (item as Section).items as ItemSource;
            if (sourceItem.type === "list") {
                let sourceList: any[] = getNested(data, sourceItem.source);
                if (sourceList) {
                    items = sourceList.map((i) => (
                        <ModularRenderer
                            data={typeof i === "object" ? i : { this: i }}
                            item={sourceItem.renderer}
                        />
                    ));
                }
            }
        } else {
            items = ((item as Section).items as ModularRenderItem[]).map(
                (i) => <ModularRenderer data={data} item={i} />
            );
        }
    } else {
        items = [];
    }

    switch (item.type) {
        case "markdown":
            let parsedVars: { [key: string]: string };
            if (item.extra_variables) {
                parsedVars = {};
                Object.keys(item.extra_variables).forEach((varName) => {
                    parsedVars[varName] = renderText(
                        data,
                        (item.extra_variables as { [key: string]: RenderText })[
                            varName
                        ]
                    );
                });
            }

            let lines: RenderText[] = getNested(data, item.text_source);

            internalComponent = (
                <Typography variant="body1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {lines
                            .map((value) =>
                                renderText(
                                    data,
                                    parsedVars
                                        ? renderText(parsedVars, value)
                                        : value
                                )
                            )
                            .join("\n")}
                    </ReactMarkdown>
                </Typography>
            );
            break;

        case "section":
            const sectionHeader = (
                <AccordionSummary
                    expandIcon={item.canExpand ? <MdExpandMore /> : <></>}
                >
                    {item.icon ? (
                        <AbstractIcon
                            type={item.icon.group}
                            name={item.icon.name}
                            className="section-header-icon"
                        />
                    ) : (
                        <></>
                    )}{" "}
                    <Typography className="section-header-text" variant="h5">
                        {renderText(data, item.title)}
                    </Typography>
                    {item.subtitle ? (
                        <Typography className="section-header-subtitle">
                            {renderText(data, item.subtitle)}
                        </Typography>
                    ) : (
                        <></>
                    )}
                </AccordionSummary>
            );

            if (item.canExpand) {
                internalComponent = (
                    <Accordion
                        expanded={exp}
                        sx={{
                            maxHeight: item.max_height
                                ? item.max_height + "px"
                                : undefined,
                        }}
                        onClick={() => setExp(!exp)}
                    >
                        {sectionHeader}
                        <AccordionDetails>{items}</AccordionDetails>
                    </Accordion>
                );
            } else {
                internalComponent = (
                    <Accordion
                        expanded={true}
                        sx={{
                            maxHeight: item.max_height
                                ? item.max_height + "px"
                                : undefined,
                        }}
                    >
                        {sectionHeader}
                        <AccordionDetails>{items}</AccordionDetails>
                    </Accordion>
                );
            }
            break;

        case "columns":
            internalComponent = (
                <Stack direction={"row"} spacing={item.spacing ?? 2}>
                    {items}
                </Stack>
            );
            break;

        case "container":
            internalComponent = (
                <Card
                    variant={item.variant}
                    sx={{
                        maxHeight: item.max_height
                            ? item.max_height + "px"
                            : undefined,
                    }}
                >
                    <CardHeader
                        title={
                            <Typography variant="h6">
                                {renderText(data, item.title)}
                            </Typography>
                        }
                        subheader={
                            item.subtitle
                                ? renderText(data, item.subtitle)
                                : undefined
                        }
                        avatar={
                            item.icon ? (
                                <Avatar>
                                    <AbstractIcon
                                        className="container-icon"
                                        type={item.icon.group}
                                        name={item.icon.name}
                                    />
                                </Avatar>
                            ) : undefined
                        }
                    />
                    <CardContent>{items}</CardContent>
                </Card>
            );
            break;

        case "masonry":
            internalComponent = (
                <Masonry
                    columns={item.columns}
                    spacing={item.spacing ?? 2}
                    className="modular-masonry"
                >
                    {items.map((value) => (
                        <Box className="modular-masonry-item">{value}</Box>
                    ))}
                </Masonry>
            );
            break;

        case "divider":
            internalComponent = (
                <Divider variant={item.variant ?? "middle"}>
                    {item.text && renderText(data, item.text)}
                </Divider>
            );
            break;

        case "chip":
            internalComponent = (
                <Chip
                    icon={
                        item.icon && (
                            <AbstractIcon
                                type={item.icon.group}
                                name={item.icon.name}
                                className="chip-icon"
                            />
                        )
                    }
                    className="chip"
                    label={renderText(data, item.text)}
                />
            );
    }

    return (
        <Box className={`modular-box type-${item.type}`}>
            {internalComponent}
        </Box>
    );
}
