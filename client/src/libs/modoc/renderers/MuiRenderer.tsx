import RenderParser from "../renderParser";
import React from "react";
import {
    RenderChipItem,
    RenderDividerItem,
    RenderGroupItem,
    RenderListItem,
    RenderMarkdownItem,
    RenderStackItem,
    RenderTextItem
} from "../types/renderTypes";
import { Avatar, Chip, Divider, Stack, Typography } from "@mui/material";
import { RawData, AllRenderItems, AllSourceItems } from "../types";
import * as ReactIconsMd from "react-icons/md";
import * as ReactIconsGi from "react-icons/gi";
import { IconType } from "react-icons";
import { isArray } from "../types/guards";
import ReactMarkdown from "react-markdown";

export default class MuiRenderParser<
    T extends AllRenderItems = AllRenderItems
> extends RenderParser<T> {
    public renderers: {
        [key: string]: (children: JSX.Element[], object: any) => JSX.Element;
    } = {
        group: this.renderGroup,
        text: this.renderText,
        divider: this.renderDivider,
        chip: this.renderChip,
        stack: this.renderStack,
        list: this.renderList,
        markdown: this.renderMarkdown
    };

    private iconMap = {
        md: ReactIconsMd,
        gi: ReactIconsGi
    };

    constructSelf(
        data: RawData,
        renderer: AllRenderItems | AllSourceItems
    ): MuiRenderParser {
        return new MuiRenderParser(data, renderer);
    }

    Icon(props: { name: string; [key: string]: any }) {
        const [family, id] = props.name.split(".");
        try {
            const IconElement: IconType = (
                this.iconMap[family as "md" | "gi"] as any
            )[id];
            return <IconElement className="mui-icon" {...props} />;
        } catch (e) {
            throw `Failed to load icon ${props.name}`;
        }
    }

    renderGroup(children: JSX.Element[], _: RenderGroupItem): JSX.Element {
        return <div className="modoc_mui-group">{children}</div>;
    }

    renderText(_: JSX.Element[], object: RenderTextItem): JSX.Element {
        const style = {
            fontWeight: object.style.includes("bold") ? 400 : undefined,
            textDecorationLine: [
                object.style.includes("underline") ? "underline" : "",
                object.style.includes("strikethrough") ? "line-through" : ""
            ]
                .join(" ")
                .trim(),
            fontStyle: object.style.includes("italic") ? "italic" : undefined
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
        children: JSX.Element[],
        object: RenderDividerItem
    ): JSX.Element {
        return (
            <Divider
                className="modoc_mui-divider"
                variant={
                    {
                        full: "fullWidth",
                        inset: "inset",
                        middle: "middle"
                    }[object.variant] as any
                }
            >
                {children}
            </Divider>
        );
    }

    renderChip(_: JSX.Element[], object: RenderChipItem): JSX.Element {
        let avatar: JSX.Element | undefined = undefined;
        if (object.avatar) {
            switch (object.avatar.type) {
                case "icon":
                    avatar = (
                        <Avatar>
                            <this.Icon name={object.avatar.name} />
                        </Avatar>
                    );
                    break;
                case "image":
                    avatar = (
                        <Avatar
                            src={this.parseValueItem(object.avatar.source)}
                            alt={this.parseValueItem(object.avatar.alt)}
                        />
                    );
                    break;
                case "text":
                    avatar = (
                        <Avatar>
                            {this.parseValueItem(object.avatar.text)}
                        </Avatar>
                    );
                    break;
            }
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

    renderStack(children: JSX.Element[], object: RenderStackItem): JSX.Element {
        return (
            <Stack
                className="modoc_mui-stack"
                direction={object.direction === "horizontal" ? "row" : "column"}
                spacing={object.spacing || 2}
            >
                {children}
            </Stack>
        );
    }

    renderList(children: JSX.Element[], object: RenderListItem): JSX.Element {
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

    renderMarkdown(_: JSX.Element[], object: RenderMarkdownItem): JSX.Element {
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
}
