import * as React from "react";
import { useState, useEffect } from "react";
import RenderParser from "./renderParser";
import { AllRenderItems, FormSpec } from "./types";
import { AllSourceItems } from "./types";
import { RawData } from "./types";
import { MuiRenderParser } from "./renderers";
import { parseNested } from "./util";

type ModularRendererProps = {
    data: RawData;
    renderer: AllRenderItems | AllSourceItems;
    parser: typeof RenderParser;
    formSpec?: FormSpec;
    onChange?: (spec: FormSpec) => void;
};

/**
 * ModularRenderer functional component
 * @param props Instance of ModularRenderProps
 * @return Rendered tree
 */
export function ModularRenderer(props: ModularRendererProps) {
    const [updateFuncs, setUpdateFuncs] = useState<{
        [key: string]: ((data: FormSpec) => void)[];
    }>({});
    const [form, setForm] = useState<FormSpec>(props.formSpec || {});
    const [parser, setParser] = useState<RenderParser<any>>(
        null as unknown as RenderParser
    );
    useEffect(() => {
        setParser(
            new props.parser(
                props.data,
                props.renderer,
                props.formSpec ?? {},
                (path: string, value: any) => {
                    let data: any = JSON.parse(
                        JSON.stringify(props.formSpec ?? {})
                    );
                    data[path] = value;
                    const updated = [];
                    for (let k of Object.keys(data)) {
                        if (data[k] !== form[k]) {
                            updated.push(k);
                        }
                    }
                    for (let u of updated) {
                        if (Object.keys(updateFuncs).includes(u)) {
                            updateFuncs[u].forEach((f) => f(data));
                        }
                    }
                    setForm(data);
                    props.onChange && props.onChange(data);
                },
                updateFuncs,
                (key: string, func: (data: FormSpec) => void) => {
                    console.log("Adding func.");
                    if (Object.keys(updateFuncs).includes(key)) {
                        updateFuncs[key].push(func);
                    } else {
                        updateFuncs[key] = [func];
                    }
                    setUpdateFuncs(updateFuncs);
                }
            )
        );
    }, [props, updateFuncs, form]);
    const [rendered, setRendered] = useState<JSX.Element | null>(null);

    useEffect(() => {
        if (!parser) {
            return;
        }
        parser.setData(props.data);
        setUpdateFuncs({});
        setRendered(parser.render());
    }, [props.data, parser]);

    useEffect(() => {
        if (!parser) {
            return;
        }
        parser.setRenderer(props.renderer);
        setUpdateFuncs({});
        setRendered(parser.render());
    }, [props.renderer, parser]);

    useEffect(() => {
        const updated = [];
        for (let k of Object.keys(props.formSpec ?? {})) {
            if ((props.formSpec ?? {})[k] !== form[k]) {
                updated.push(k);
            }
        }
        setForm(props.formSpec ?? {});
        for (let u of updated) {
            if (Object.keys(updateFuncs).includes(u)) {
                updateFuncs[u].forEach((f) => f(props.formSpec ?? {}));
            }
        }
    }, [props.formSpec, parser, form, updateFuncs]);

    return <div className="modoc_modular-renderer">{rendered}</div>;
}

export { MuiRenderParser };
