import RenderParser from "../renderParser";
import React from "react";
import {
    RenderChipItem,
    RenderDividerItem,
    RenderGroupItem,
    RenderListItem,
    RenderMarkdownItem,
    RenderStackItem,
    RenderTextItem,
    RenderTableItem,
    RenderTableRowItem,
    RenderAbsoluteContainerItem,
    RenderAbsoluteItem,
    RenderAccordionItem,
    RenderCardItem,
    RenderSegmentItem,
    RenderMasonryItem,
} from "../types/renderTypes";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Chip,
    Divider,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import {
    RawData,
    AllRenderItems,
    AllSourceItems,
    ValueItem,
    AvatarType,
} from "../types";
import * as ReactIconsMd from "react-icons/md";
import * as ReactIconsGi from "react-icons/gi";
import { IconType } from "react-icons";
import { isArray } from "../types/guards";
import ReactMarkdown from "react-markdown";
import { Icon } from "./common";
import { Masonry } from "@mui/lab";

export default class MuiRenderParser<
    T extends AllRenderItems = AllRenderItems
> extends RenderParser<T> {
    public renderers: {
        [key: string]: (
            children: (JSX.Element | null)[],
            object: any
        ) => JSX.Element;
    } = {
        group: this.renderGroup,
        text: this.renderText,
        divider: this.renderDivider,
        chip: this.renderChip,
        stack: this.renderStack,
        list: this.renderList,
        markdown: this.renderMarkdown,
        table: this.renderTable,
        tableRow: this.renderTableRow,
        accordion: this.renderAccordion,
        card: this.renderCard,
        "absolute-container": this.renderAbsoluteContainer,
        absolute: this.renderAbsoluteItem,
        segment: this.renderSegmentItem,
        masonry: this.renderMasonryItem,
    };

    private iconMap = {
        md: ReactIconsMd,
        gi: ReactIconsGi,
    };

    constructSelf(
        data: RawData,
        renderer: AllRenderItems | AllSourceItems
    ): MuiRenderParser {
        return new MuiRenderParser(data, renderer);
    }

    private _renderAvatar(item: AvatarType) {
        switch (item.type) {
            case "icon":
                return (
                    <Avatar>
                        <Icon icon={item.icon} />
                    </Avatar>
                );
            case "image":
                return (
                    <Avatar
                        src={this.parseValueItem(item.source)}
                        alt={this.parseValueItem(item.alt)}
                    />
                );
            case "text":
                return <Avatar>{this.parseValueItem(item.text)}</Avatar>;
        }
    }

    public Icon(props: { name: string; [key: string]: any }) {
        const [family, id] = props.name.split(".");
        try {
            const IconElement: IconType = (
                this.iconMap[family as "md" | "gi"] as any
            )[id];
            return <IconElement className="mui-icon" {...props} />;
        } catch (e) {
            throw new Error(`Failed to load icon ${props.name}`);
        }
    }

    renderGroup(
        children: (JSX.Element | null)[],
        _: RenderGroupItem
    ): JSX.Element {
        return <div className="modoc_mui-group">{children}</div>;
    }

    renderText(_: (JSX.Element | null)[], object: RenderTextItem): JSX.Element {
        const style = {
            fontWeight: object.style.includes("bold") ? 400 : undefined,
            textDecorationLine: [
                object.style.includes("underline") ? "underline" : "",
                object.style.includes("strikethrough") ? "line-through" : "",
            ]
                .join(" ")
                .trim(),
            fontStyle: object.style.includes("italic") ? "italic" : undefined,
        };
        if (object.textType === "raw") {
            return (
                <span className="modoc_mui-text" style={style}>
                    {this.parseValueItem(object.text)}
                </span>
            );
        } else {
            return (
                <Typography
                    className="modoc_mui-text"
                    variant={object.textType}
                    sx={style}
                >
                    {this.parseValueItem(object.text)}
                </Typography>
            );
        }
    }

    renderDivider(
        children: (JSX.Element | null)[],
        object: RenderDividerItem
    ): JSX.Element {
        return (
            <Divider
                className="modoc_mui-divider"
                variant={
                    {
                        full: "fullWidth",
                        inset: "inset",
                        middle: "middle",
                    }[object.variant] as any
                }
            >
                {children}
            </Divider>
        );
    }

    renderChip(_: (JSX.Element | null)[], object: RenderChipItem): JSX.Element {
        let avatar: JSX.Element | undefined = undefined;
        if (object.avatar) {
            avatar = this._renderAvatar(object.avatar);
        }
        return (
            <Chip
                className="modoc_mui-chip"
                variant={object.filled ? "filled" : "outlined"}
                label={this.parseValueItem(object.text)}
                avatar={avatar}
            />
        );
    }

    renderStack(
        children: (JSX.Element | null)[],
        object: RenderStackItem
    ): JSX.Element {
        return (
            <Stack
                className={
                    "modoc_mui-stack" +
                    (object.direction === "horizontal" ? " row" : " column")
                }
                direction={object.direction === "horizontal" ? "row" : "column"}
                spacing={object.spacing || 2}
                sx={{
                    "& > *": {
                        width:
                            object.direction === "horizontal"
                                ? `calc(100% / ${
                                      children.filter((c) => c !== null).length
                                  })`
                                : undefined,
                    },
                }}
            >
                {children}
            </Stack>
        );
    }

    renderList(
        children: (JSX.Element | null)[],
        object: RenderListItem
    ): JSX.Element {
        const items: JSX.Element[] = children.map((c) => (
            <li className="modoc_mui-list-item">{c}</li>
        ));
        if (object.itemMarkers.ordered) {
            return (
                <ol
                    className="modoc_mui-list"
                    style={{ listStyleType: object.itemMarkers.style }}
                >
                    {items}
                </ol>
            );
        } else {
            return (
                <ul
                    className="modoc_mui-list"
                    style={{ listStyleType: object.itemMarkers.style }}
                >
                    {items}
                </ul>
            );
        }
    }

    renderMarkdown(
        _: (JSX.Element | null)[],
        object: RenderMarkdownItem
    ): JSX.Element {
        let text: string;
        if (isArray(object.text)) {
            text = object.text.map(this.parseValueItem).join("\n");
        } else {
            text = this.parseValueItem(object.text);
        }

        return (
            <span className="modoc_mui-markdown">
                <ReactMarkdown children={text} />
            </span>
        );
    }

    renderTable(
        children: (JSX.Element | null)[],
        object: RenderTableItem
    ): JSX.Element {
        return (
            <Table className="modoc_mui-table">
                <TableHead>
                    <TableRow className="table-header">
                        {object.headers.map((v: ValueItem) => (
                            <TableCell
                                className="table-cell"
                                key={Math.random()}
                            >
                                {this.parseValueItem(v)}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>{children}</TableBody>
            </Table>
        );
    }

    renderTableRow(
        children: (JSX.Element | null)[],
        _: RenderTableRowItem
    ): JSX.Element {
        return (
            <TableRow className="table-row">
                {children.map((cell: JSX.Element | null) => (
                    <TableCell className="table-cell" key={Math.random()}>
                        {cell}
                    </TableCell>
                ))}
            </TableRow>
        );
    }

    renderAccordion(
        children: (JSX.Element | null)[],
        object: RenderAccordionItem
    ): JSX.Element {
        let icon: JSX.Element | undefined = undefined;
        if (object.icon) {
            icon = this._renderAvatar(object.icon);
        }

        return (
            <Accordion
                className="modoc_mui-accordion"
                expanded={object.alwaysOpen === true ? true : undefined}
            >
                <AccordionSummary
                    expandIcon={
                        object.alwaysOpen === true ? null : (
                            <ReactIconsMd.MdExpandMore />
                        )
                    }
                >
                    {icon ?? null}
                    <Typography>{this.parseValueItem(object.text)}</Typography>
                </AccordionSummary>
                <AccordionDetails
                    style={{
                        maxHeight:
                            object.maxHeight === undefined
                                ? undefined
                                : object.maxHeight + "px",
                        overflowY: "auto",
                    }}
                >
                    {children}
                </AccordionDetails>
            </Accordion>
        );
    }

    renderCard(children: (JSX.Element | null)[], object: RenderCardItem) {
        let icon: JSX.Element | undefined = undefined;
        if (object.title && object.title.icon) {
            icon = this._renderAvatar(object.title.icon);
        }

        return (
            <Card className="modoc_mui-card" variant={object.variant}>
                {object.title && (
                    <CardHeader
                        avatar={icon}
                        title={
                            object.title.title &&
                            this.parseValueItem(object.title.title)
                        }
                        subheader={
                            object.title.subtitle &&
                            this.parseValueItem(object.title.subtitle)
                        }
                    />
                )}
                {object.media && (
                    <CardMedia
                        component="img"
                        height={object.media.height ?? undefined}
                        image={this.parseValueItem(object.media.src)}
                        alt={this.parseValueItem(object.media.alt)}
                    />
                )}
                <CardContent>{children}</CardContent>
            </Card>
        );
    }

    renderAbsoluteContainer(
        children: (JSX.Element | null)[],
        object: RenderAbsoluteContainerItem
    ): JSX.Element {
        return (
            <Box
                height={object.height}
                sx={{ display: "inline-block" }}
                className="modoc_mui-absolute-container"
            >
                {children}
            </Box>
        );
    }

    renderAbsoluteItem(
        children: (JSX.Element | null)[],
        object: RenderAbsoluteItem
    ): JSX.Element {
        return (
            <Box
                sx={{
                    top: `${object.top}%`,
                    left: `${object.left}%`,
                    width: `${object.width}%`,
                    height: `${object.height}%`,
                    display: "inline-block",
                }}
                className="modoc_mui-absolute-item"
            >
                {children}
            </Box>
        );
    }

    renderSegmentItem(
        children: (JSX.Element | null)[],
        object: RenderSegmentItem
    ): JSX.Element {
        return (
            <Paper variant={object.variant} className="modoc_mui-segment">
                {children}
            </Paper>
        );
    }

    renderMasonryItem(
        children: (JSX.Element | null)[],
        object: RenderMasonryItem
    ): JSX.Element {
        return (
            <Masonry
                spacing={object.spacing ?? 2}
                columns={object.columns}
                className="modoc_mui-masonry"
            >
                {children}
            </Masonry>
        );
    }
}
