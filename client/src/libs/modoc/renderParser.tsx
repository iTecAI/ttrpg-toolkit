import { isArray, isRenderItem, isSourceItem } from "./types/guards";
import { AllRenderItems, AllSourceItems, FormSpec } from "./types";
import { GeneratorSourceItem, ListSourceItem } from "./types";
import { ParsedFunction, RawData, ValueItem } from "./types";
import { parseFunction, parseValueItem } from "./util";
import parseNested from "./util/nestedParser";
import React from "react";

/**
 * Base Render Parser class. Should be extended.
 * When extending, set public constructSelf function
 * And set public sourceParsers and public renderers as needed.
 */
// eslint-disable-next-line
export default class RenderParser<T extends AllRenderItems = AllRenderItems> {
    /**
     * Array of parsed children (all value items parsed, expanded to RenderParsers)
     */
    private children: RenderParser[];

    /**
     * Add additional sourceParsers here when extending
     */
    public sourceParsers: {
        [key: string]: (item: any) => RenderParser[];
    } = {
        list: this.parseListSourceItem,
        generator: this.parseGeneratorSourceItem,
    };

    /**
     * Add additional render functions here when extending
     */
    public renderers: {
        [key: string]: (
            children: (JSX.Element | null)[],
            object: AllRenderItems
        ) => JSX.Element;
    } = {};

    /**
     * RenderParser is the React framework-agnostic base class.
     * It has no rendering capability by itself, but can be extended to add such capability.
     * @param data Raw data object, likely from server or something
     * @param renderer RenderItem specification or SourceItem
     */
    constructor(
        protected data: RawData,
        protected renderer: AllRenderItems | AllSourceItems,
        protected formData: FormSpec,
        protected updateData: (path: string, value: any) => void,
        protected updateFuncs: { [key: string]: ((data: FormSpec) => void)[] },
        protected addUpdateFunc: (
            key: string,
            func: (data: FormSpec) => void
        ) => void
    ) {
        this.children = [];
        if (isRenderItem(this.renderer)) {
            this.children = this.expandRenderItems(this.renderer);
        } else {
            this.children = this.parseSourceItem(this.renderer);
        }
    }

    /**
     * Sets new data & re-parses all children
     * @param data New data
     */
    setData(data: RawData) {
        this.data = data;

        if (isRenderItem(this.renderer)) {
            this.children = this.expandRenderItems(this.renderer);
        } else {
            this.children = this.parseSourceItem(this.renderer);
        }
    }

    /**
     * Sets new renderer and re-parses all children
     * @param renderer New RenderItem or SourceItem
     */
    setRenderer(renderer: AllRenderItems | AllSourceItems) {
        this.renderer = renderer;

        if (isRenderItem(this.renderer)) {
            this.children = this.expandRenderItems(this.renderer);
        } else {
            this.children = this.parseSourceItem(this.renderer);
        }
    }

    setFormData(data: FormSpec) {}

    /**
     * Parser for ListSourceItems
     * @param item ListSourceItem
     * @returns Array of RenderParser
     */
    parseListSourceItem<T extends AllRenderItems>(
        item: ListSourceItem<T>
    ): RenderParser<T>[] {
        const data = parseNested(this.data, item.source);
        if (isArray(data)) {
            return data.map((d) =>
                this.constructSelf(
                    d,
                    item.renderer,
                    this.formData,
                    this.updateData,
                    this.updateFuncs,
                    this.addUpdateFunc
                )
            );
        } else {
            console.warn(`${JSON.stringify(data)} is not an any[] instance.`);
            return [];
        }
    }

    /**
     * Parser for GeneratorSourceItems
     * @param item GeneratorSourceItem
     * @returns Array of RenderParser
     */
    parseGeneratorSourceItem<T extends AllRenderItems>(
        item: GeneratorSourceItem<T>
    ): RenderParser<T>[] {
        const rawResults: RawData[] = this.execParsedFunction(item.function);
        return rawResults.map((result) =>
            this.constructSelf(
                result,
                item.renderer,
                this.formData,
                this.updateData,
                this.updateFuncs,
                this.addUpdateFunc
            )
        );
    }

    /**
     * Executes a ParsedFunction object, passing in required data and loading string code.
     * @param func ParsedFunction object
     * @returns Returned data
     */
    execParsedFunction(func: ParsedFunction): any {
        const executor = parseFunction(func.function);
        const parsedOptions: { [key: string]: any } = {};
        for (let k of Object.keys(func.opts)) {
            parsedOptions[k] = this.parseValueItem(func.opts[k]);
        }
        const result = executor(parsedOptions);
        return result;
    }

    /**
     * Parse a ValueItem. Likely will be the most useful in render functions.
     * @param item ValueItem to parse. Can be a literal, a "$directive:data" string, or a Text/Functional/DataItem
     * @returns The value retrieved/created
     */
    parseValueItem(item: ValueItem): any {
        const out = parseValueItem(item, this.data, this.formData);
        return out.result;
    }

    /**
     * Parses a SourceItem
     * @param item SourceItem representation
     * @returns Array of RenderParsers
     */
    parseSourceItem<T extends AllRenderItems = AllRenderItems>(
        item: AllSourceItems<T>
    ): RenderParser<T>[] {
        if (item.type in this.sourceParsers) {
            return this.sourceParsers[item.type].bind(this)(item);
        }
        throw new Error(`Unknown SourceItem type ${item.type}`);
    }

    /**
     * Expands RenderItem children into RenderParsers
     * @param item RenderItem
     * @returns Array of RenderParsers
     */
    expandRenderItems(item: AllRenderItems): RenderParser[] {
        if ("children" in item) {
            if (isSourceItem(item.children)) {
                return this.parseSourceItem(item.children); // TODO
            } else {
                return item.children.map((v: any) =>
                    this.constructSelf(
                        this.data,
                        v,
                        this.formData,
                        this.updateData,
                        this.updateFuncs,
                        this.addUpdateFunc
                    )
                );
            }
        } else if ("child" in item && item.child) {
            return [
                this.constructSelf(
                    this.data,
                    item.child,
                    this.formData,
                    this.updateData,
                    this.updateFuncs,
                    this.addUpdateFunc
                ),
            ];
        } else {
            return [];
        }
    }

    /**
     * Constructs self (for internal functions that instantiate new RenderParsers)
     * @param data RawData
     * @param renderer RenderItem or SourceItem
     * @returns RenderParser instance
     */
    constructSelf<T extends AllRenderItems = AllRenderItems>(
        data: RawData,
        renderer: AllRenderItems | AllSourceItems,
        formData: FormSpec,
        updateData: (path: string, value: any) => void,
        updateFuncs: { [key: string]: ((data: FormSpec) => void)[] },
        addUpdateFunc: (key: string, func: (data: FormSpec) => void) => void
    ): RenderParser {
        return new RenderParser<T>(
            data,
            renderer,
            formData,
            updateData,
            updateFuncs,
            addUpdateFunc
        );
    }

    /**
     * Renders using current data and renderer
     * @returns JSX Element
     */
    render(): JSX.Element | null {
        try {
            if (this.renderer.conditionalRender) {
                if (!this.execParsedFunction(this.renderer.conditionalRender)) {
                    return null;
                }
            }
            if (this.renderer.supertype === "render") {
                if (Object.keys(this.renderers).includes(this.renderer.type)) {
                    return (
                        <span key={Math.random()}>
                            {this.renderers[this.renderer.type].bind(this)(
                                this.children.map((r) => r.render()),
                                this.renderer
                            )}
                        </span>
                    );
                } else {
                    throw new Error(
                        `Unknown renderer type ${this.renderer.type}`
                    );
                }
            } else {
                return (
                    <span key={Math.random()}>
                        {this.renderers[this.renderer.type].bind(this)(
                            this.children.map((r) => r.render()),
                            this.renderer.renderer
                        )}
                    </span>
                );
            }
        } catch (e: any) {
            return <span key={Math.random()}>{this.reportError(e)}</span>;
        }
    }

    reportError(error: Error): JSX.Element {
        return <></>;
    }
}
