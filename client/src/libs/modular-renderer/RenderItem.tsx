import * as React from "react";
import { useContext, useState, useMemo } from "react";
import { AllItems, FormData } from "./types";
import { isArray, isSourceItem } from "./types/guards";
import { DocumentContext } from "./utility/document_communication";
import { Renderers } from "./renderers";
import SourceItem from "./SourceItem";
import { parseFunction } from "./utility/parsers";

/**
 * Generic <Error /> element
 * @param text Text of error
 * @returns <Error>Error: {text}</Error>
 */
export function Error(props: { text: string }): JSX.Element {
    return <div className="render-item child error">Error: {props.text}</div>;
}

/**
 * Renders any item or item[]
 * @param renderer Single AllItems (RendererItem or SourceItem) or array of AllItems
 * @param dataOverride (Optional) Static data to override DocumentContext
 * @param formDataOverride (Optional) Form data to override DocumentContext
 * @returns Rendered <Item> or array of rendered <Item>
 */
export default function RenderItem(props: {
    renderer: AllItems | AllItems[];
    dataOverride?: any;
    formDataOverride?: FormData;
}): JSX.Element {
    const context = useContext(DocumentContext);
    const [data, setData] = useState<any>({});
    const [formData, setFormData] = useState<FormData>({});
    const key = useState(Math.random())[0];

    function setDatas() {
        if (context == null) {
            if (!props.dataOverride || !props.formDataOverride) {
                return;
            }
            setData(props.dataOverride ?? {});
            setFormData(props.dataOverride ?? {});
        } else {
            if (props.dataOverride) {
                setData(props.dataOverride);
            } else {
                setData(context.data);
            }
            if (props.formDataOverride) {
                setFormData(props.formDataOverride);
            } else {
                setFormData(context.values);
            }
        }
    }

    useMemo(setDatas, []);

    useMemo(() => {
        if (context) {
            if (
                (data !== context.data && data !== props.dataOverride) ||
                (formData !== context.values &&
                    formData !== props.formDataOverride)
            ) {
                setDatas();
            }
        }
    }, [context]);
    if (isArray(props.renderer)) {
        return (
            <>
                {props.renderer.map((v) => (
                    <RenderItem
                        {...props}
                        renderer={v}
                        key={JSON.stringify(v)}
                    />
                ))}
            </>
        );
    }

    if (isSourceItem(props.renderer)) {
        if (props.renderer.conditionalRender) {
            const doRender = parseFunction(
                props.renderer.conditionalRender,
                data,
                formData
            );
            if (!doRender) {
                return <></>;
            }
        }
        //console.log("INJECT", data);
        return (
            <SourceItem
                source={props.renderer}
                data={data}
                formData={formData}
                key={key}
            />
        );
    } else {
        if (props.renderer.conditionalRender) {
            const doRender = parseFunction(
                props.renderer.conditionalRender,
                data,
                formData
            );
            if (!doRender) {
                return <></>;
            }
        }
        const DynamicElement = Renderers[props.renderer.type];
        const result = DynamicElement && (
            <DynamicElement
                renderer={props.renderer}
                data={data}
                formData={formData}
            />
        );
        //console.log("RES:", result);
        return (
            <span className="rendered-item single" key={key}>
                {result ?? (
                    <Error
                        text={`Renderer type ${props.renderer.type} not found.`}
                    />
                )}
            </span>
        );
    }
}
