import * as React from "react";
import { useState, useEffect } from "react";
import RenderParser from "./renderParser";
import { AllRenderItems } from "./types";
import { AllSourceItems } from "./types";
import { RawData } from "./types";
import { MuiRenderParser } from "./renderers";

type ModularRendererProps = {
    data: RawData;
    renderer: AllRenderItems | AllSourceItems;
    parser: typeof RenderParser;
};

/**
 * ModularRenderer functional component
 * @param props Instance of ModularRenderProps
 * @return Rendered tree
 */
export function ModularRenderer(props: ModularRendererProps) {
    const [parser] = useState<RenderParser<any>>(
        new props.parser(props.data, props.renderer)
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
