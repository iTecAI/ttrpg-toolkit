import * as React from "react";
import { AllSourceItems, FormData } from "./types";
import {
    parseGeneratorSourceItem,
    parseListSourceItem,
} from "./utility/parsers";
import RenderItem, { Error } from "./RenderItem";

export default function SourceItem(props: {
    source: AllSourceItems;
    data: any;
    formData: FormData;
}): JSX.Element {
    let result: any[];
    switch (props.source.type) {
        case "generator":
            result = parseGeneratorSourceItem(
                props.source,
                props.data,
                props.formData
            );
            break;
        case "list":
            result = parseListSourceItem(
                props.source,
                props.data,
                props.formData
            );
            break;
        default:
            return (
                <Error
                    text={`SourceItem type ${
                        (props.source as any).type
                    } not found.`}
                />
            );
    }
    const srcRender = props.source.renderer;
    return (
        <div className="rendered-item source">
            {result.map((v) => (
                <RenderItem renderer={srcRender} dataOverride={v} />
            ))}
        </div>
    );
}
