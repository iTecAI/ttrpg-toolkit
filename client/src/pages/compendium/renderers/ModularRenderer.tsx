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
import {
    dynamicFunction,
    getNested,
    parseOptionsDynamicFunction,
    renderText,
} from "./renderUtils";
import AbstractIcon from "../../../util/AbstractIcon";
import { MdError, MdExpandMore } from "react-icons/md";
import { Box } from "@mui/system";
import { Masonry } from "@mui/lab";
import { loc } from "../../../util/localization";

type ConditionalRender = {
    function: string; // (opts) => boolean
    options: { [key: string]: string };
};

type MarkdownRender = {
    type: "markdown";
    text_source: string;
    extra_variables?: { [key: string]: RenderText };
    conditional?: ConditionalRender;
};

type ListItemSource = {
    type: "list";
    source: string;
    renderer: ModularRenderItem;
};

type SwitchItemSource = {
    type: "switch";
    function: string;
    options: { [key: string]: string }; // Should be a function that returns a string value based on options.
    output_map: { [key: string]: ModularRenderItem[] };
};

type GeneratorItemSource = {
    type: "generator";
    source: string;
    function: string; // (source: any) -> [{[key: string]: RenderText}]
    renderer: ModularRenderItem;
};

type ItemSource = ListItemSource | SwitchItemSource | GeneratorItemSource;

type Section = {
    type: "section";
    canExpand?: boolean;
    defaultExpanded?: boolean;
    title: RenderText;
    subtitle?: RenderText;
    icon?: IconProps;
    items: ModularRenderItem[] | ItemSource;
    max_height?: number;
    conditional?: ConditionalRender;
};

type Columns = {
    type: "columns";
    spacing?: number;
    items: ModularRenderItem[] | ItemSource;
    conditional?: ConditionalRender;
};

type Rows = {
    type: "rows";
    spacing?: number;
    items: ModularRenderItem[] | ItemSource;
    conditional?: ConditionalRender;
};

type Container = {
    type: "container";
    variant: "elevation" | "outlined";
    title: RenderText;
    subtitle?: RenderText;
    icon?: IconProps;
    items: ModularRenderItem[] | ItemSource;
    max_height?: number;
    conditional?: ConditionalRender;
};

type MasonryColumns = {
    type: "masonry";
    spacing?: number;
    columns: number;
    items: ModularRenderItem[] | ItemSource;
    conditional?: ConditionalRender;
};

type DividerItem = {
    type: "divider";
    variant?: "fullWidth" | "middle";
    text?: RenderText;
    conditional?: ConditionalRender;
};

type ChipItem = {
    type: "chip";
    icon?: IconProps;
    text: RenderText;
    conditional?: ConditionalRender;
};

type GroupItem = {
    type: "group";
    conditional?: ConditionalRender;
    items: ModularRenderItem[] | ItemSource;
};

type TextItem = {
    type: "text";
    conditional?: ConditionalRender;
    variant:
        | "h1"
        | "h2"
        | "h3"
        | "h4"
        | "h5"
        | "h6"
        | "subtitle1"
        | "subtitle2"
        | "body1"
        | "body2"
        | "button"
        | "caption"
        | "overline";
    text: RenderText;
};

export type ModularRenderItem =
    | MarkdownRender
    | Section
    | Columns
    | Rows
    | Container
    | MasonryColumns
    | DividerItem
    | ChipItem
    | GroupItem
    | TextItem;

export default function ModularRenderer(props: {
    data: { [key: string]: any };
    item: ModularRenderItem;
}) {
    const { data, item } = props;
    const [exp, setExp] = useState<boolean>(
        item.type === "section" ? item.defaultExpanded ?? false : false
    );
    try {
        let internalComponent: React.ReactNode;

        let items: React.ReactNode[];
        if (Object.keys(item).includes("items")) {
            items = [];
            if (
                ((item as Section).items as ModularRenderItem[]).push ===
                undefined
            ) {
                let sourceItem: ItemSource = (item as Section)
                    .items as ItemSource;
                switch (sourceItem.type) {
                    case "list":
                        let sourceList: any[] = getNested(
                            data,
                            sourceItem.source
                        );
                        if (sourceList) {
                            let doRender = (sourceItem as ListItemSource)
                                .renderer.conditional
                                ? parseOptionsDynamicFunction(
                                      (
                                          (sourceItem as ListItemSource)
                                              .renderer
                                              .conditional as ConditionalRender
                                      ).function,
                                      (
                                          (sourceItem as ListItemSource)
                                              .renderer
                                              .conditional as ConditionalRender
                                      ).options,
                                      data
                                  )
                                : true;

                            items = doRender
                                ? sourceList.map((i) => (
                                      <ModularRenderer
                                          data={
                                              typeof i === "object"
                                                  ? i
                                                  : { this: i }
                                          }
                                          item={
                                              (sourceItem as ListItemSource)
                                                  .renderer
                                          }
                                          key={Math.random()}
                                      />
                                  ))
                                : [];
                        }
                        break;
                    case "switch":
                        const result: string = parseOptionsDynamicFunction(
                            sourceItem.function,
                            sourceItem.options,
                            data
                        );
                        if (
                            Object.keys(sourceItem.output_map).includes(result)
                        ) {
                            items = (
                                (sourceItem as SwitchItemSource).output_map[
                                    result
                                ] as ModularRenderItem[]
                            )
                                .filter((x) => {
                                    if (x.conditional) {
                                        return parseOptionsDynamicFunction(
                                            x.conditional.function,
                                            x.conditional.options,
                                            data
                                        );
                                    } else {
                                        return true;
                                    }
                                })
                                .map((i) => (
                                    <ModularRenderer
                                        data={data}
                                        item={i}
                                        key={Math.random()}
                                    />
                                ));
                        }
                        break;
                    case "generator":
                        const _source = getNested(data, sourceItem.source);
                        if (!_source) {
                            items = [];
                            break;
                        }

                        const generatorResult: { [key: string]: RenderText }[] =
                            dynamicFunction(sourceItem.function, _source);

                        items = generatorResult.map((v) => (
                            <ModularRenderer
                                data={v}
                                item={
                                    (sourceItem as GeneratorItemSource).renderer
                                }
                                key={Math.random()}
                            />
                        ));
                }
            } else {
                items = ((item as Section).items as ModularRenderItem[])
                    .filter((x) => {
                        if (x.conditional) {
                            return parseOptionsDynamicFunction(
                                x.conditional.function,
                                x.conditional.options,
                                data
                            );
                        } else {
                            return true;
                        }
                    })
                    .map((i) => (
                        <ModularRenderer
                            data={data}
                            item={i}
                            key={Math.random()}
                        />
                    ));
            }
        } else {
            items = [];
            if (item.conditional) {
                const conditionalResult = parseOptionsDynamicFunction(
                    item.conditional.function,
                    item.conditional.options,
                    data
                );
                if (!conditionalResult) {
                    return null;
                }
            }
        }

        switch (item.type) {
            case "markdown":
                let parsedVars: { [key: string]: string };
                if (item.extra_variables) {
                    parsedVars = {};
                    Object.keys(item.extra_variables).forEach((varName) => {
                        parsedVars[varName] = renderText(
                            data,
                            (
                                item.extra_variables as {
                                    [key: string]: RenderText;
                                }
                            )[varName]
                        );
                    });
                }

                let lines: RenderText[] =
                    getNested(data, item.text_source) ?? [];

                internalComponent = (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ node, ...props }) => (
                                <div className="md-paragraph" {...props} />
                            ),
                        }}
                        className="markdown-render"
                    >
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
                );
                break;

            case "section":
                const sectionHeader = (
                    <AccordionSummary
                        expandIcon={
                            item.canExpand ? (
                                <MdExpandMore fontSize="24px" />
                            ) : (
                                <></>
                            )
                        }
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
                        <Typography
                            className="section-header-text"
                            variant="h5"
                        >
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
                        <Accordion expanded={exp} onClick={() => setExp(!exp)}>
                            {sectionHeader}
                            <AccordionDetails
                                sx={{
                                    maxHeight: item.max_height
                                        ? item.max_height + "px"
                                        : undefined,
                                    overflowY: "auto",
                                }}
                            >
                                {items}
                            </AccordionDetails>
                        </Accordion>
                    );
                } else {
                    internalComponent = (
                        <Accordion expanded={true}>
                            {sectionHeader}
                            <AccordionDetails
                                sx={{
                                    maxHeight: item.max_height
                                        ? item.max_height + "px"
                                        : undefined,
                                    overflowY: "auto",
                                }}
                            >
                                {items}
                            </AccordionDetails>
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

            case "rows":
                internalComponent = (
                    <Stack spacing={item.spacing ?? 2}>{items}</Stack>
                );
                break;

            case "container":
                internalComponent = (
                    <Card variant={item.variant}>
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
                        <CardContent
                            sx={{
                                maxHeight: item.max_height
                                    ? item.max_height + "px"
                                    : undefined,
                                overflowY: "auto",
                            }}
                        >
                            {items}
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
                        {items.map((value) => (
                            <Box
                                className="modular-masonry-item"
                                key={Math.random()}
                            >
                                {value}
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
                break;
            case "group":
                internalComponent = <Box>{items}</Box>;
                break;
            case "text":
                internalComponent = (
                    <Typography variant={item.variant}>
                        {renderText(data, item.text)}
                    </Typography>
                );
        }

        let conditionalResult: boolean;
        if (item.conditional) {
            conditionalResult = parseOptionsDynamicFunction(
                item.conditional.function,
                item.conditional.options,
                data
            );
        } else {
            conditionalResult = true;
        }

        return (
            <Box className={`modular-box type-${item.type}`}>
                {conditionalResult ? internalComponent : <></>}
            </Box>
        );
    } catch (e) {
        console.log(e);
        return (
            <Box className={`modular-box type-error`}>
                <Card className="error-card">
                    <CardHeader
                        title={loc("compendium.renderer.error_title", {
                            type: item.type.toUpperCase(),
                            errorText: (e as any).toString(),
                        })}
                        avatar={<MdError fontSize="24px" />}
                    />
                    <CardContent>
                        <Paper
                            variant="outlined"
                            className="render-spec-container"
                        >
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: JSON.stringify(item, null, "\t")
                                        .replaceAll("\n", "<br>")
                                        .replaceAll(
                                            "\t",
                                            "<span class='json-tab'></span>"
                                        ),
                                }}
                            />
                        </Paper>
                    </CardContent>
                </Card>
            </Box>
        );
    }
}
