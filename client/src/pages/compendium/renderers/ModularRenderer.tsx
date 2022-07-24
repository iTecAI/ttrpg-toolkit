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
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { renderText } from "./renderUtils";
import AbstractIcon from "../../../util/AbstractIcon";
import { MdExpandMore } from "react-icons/md";
import { Box } from "@mui/system";
import { Masonry } from "@mui/lab";

type MarkdownRender = {
    type: "markdown";
    text: RenderText[];
    extra_variables?: { [key: string]: RenderText };
};

type Section = {
    type: "section";
    canExpand?: boolean;
    defaultExpanded?: boolean;
    title: RenderText;
    subtitle?: RenderText;
    icon?: IconProps;
    items: ModularRenderItem[];
    max_height?: number;
};

type Columns = {
    type: "columns";
    spacing?: number;
    items: ModularRenderItem[];
};

type Container = {
    type: "container";
    variant: "elevation" | "outlined";
    title: RenderText;
    subtitle?: RenderText;
    icon?: IconProps;
    items: ModularRenderItem[];
    max_height?: number;
};

type MasonryColumns = {
    type: "masonry";
    spacing?: number;
    columns: number;
    items: ModularRenderItem[];
};

type DividerItem = {
    type: "divider";
    variant?: "fullWidth" | "middle";
    text?: RenderText;
};

export type ModularRenderItem =
    | MarkdownRender
    | Section
    | Columns
    | Container
    | MasonryColumns
    | DividerItem;

export default function ModularRenderer(props: {
    data: DataItem;
    item: ModularRenderItem;
}) {
    const { data, item } = props;
    let internalComponent: React.ReactNode;
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
            internalComponent = (
                <Typography variant="body1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.text
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
            const [exp, setExp] = useState<boolean>(
                item.defaultExpanded ?? false
            );
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
                    <Typography className="section-header-text">
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
                        <AccordionDetails>
                            {item.items.map((mod) => (
                                <ModularRenderer data={data} item={mod} />
                            ))}
                        </AccordionDetails>
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
                        <AccordionDetails>
                            {item.items.map((mod) => (
                                <ModularRenderer data={data} item={mod} />
                            ))}
                        </AccordionDetails>
                    </Accordion>
                );
            }
            break;

        case "columns":
            internalComponent = (
                <Stack direction={"row"} spacing={item.spacing ?? 2}>
                    {item.items.map((mod) => (
                        <ModularRenderer data={data} item={mod} />
                    ))}
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
                        title={renderText(data, item.title)}
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
                    <CardContent>
                        {item.items.map((mod) => (
                            <ModularRenderer data={data} item={mod} />
                        ))}
                    </CardContent>
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
                    {item.items.map((value) => (
                        <Box className="modular-masonry-item">
                            <ModularRenderer data={data} item={value} />
                        </Box>
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
    }

    return <Box className="modular-box">{internalComponent}</Box>;
}
