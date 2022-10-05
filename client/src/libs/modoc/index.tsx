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
    const [parser] = useState<RenderParser<any>>(
        new props.parser(
            props.data,
            props.renderer,
            props.formSpec ?? {},
            (path: string, value: any) => {
                let data: any = JSON.parse(
                    JSON.stringify(props.formSpec ?? {})
                );
                const res: any = parseNested(data, path, value);
                if (res === null) {
                    console.warn(
                        `Attempted to update nonexistent form key ${path}. This is likely due to some edge case.`
                    );
                }
            },
            updateFuncs,
            (key: string, func: (data: FormSpec) => void) => {
                if (Object.keys(updateFuncs).includes(key)) {
                    updateFuncs[key].push(func);
                } else {
                    updateFuncs[key] = [func];
                }
                setUpdateFuncs(updateFuncs);
            }
        )
    );
    const [rendered, setRendered] = useState<JSX.Element | null>(
        parser.render()
    );

    useEffect(() => {
        parser.setData(props.data);
        setRendered(parser.render());
    }, [props.data, parser]);

    useEffect(() => {
        parser.setRenderer(props.renderer);
        setRendered(parser.render());
    }, [props.renderer, parser]);

    return <div className="modoc_modular-renderer">{rendered}</div>;
}

export { MuiRenderParser };
