import * as React from "react";
import { useContext, useState, useEffect } from "react";
import { AllItems, FormData, ModularDocument } from "./types";
import { isArray, isSourceItem } from "./types/guards";
import {
    DocumentContext,
    buildStaticContext,
} from "./utility/document_communication";
import { Renderers } from "./renderers";
import SourceItem from "./SourceItem";
import { parseFunction } from "./utility/parsers";

export function Error(props: { text: string }): JSX.Element {
    return <div className="render-item child error">Error: {props.text}</div>;
}

export default function RenderItem(props: {
    renderer: AllItems | AllItems[];
    dataOverride?: any;
    formDataOverride?: FormData;
}): JSX.Element {
    const context = useContext(DocumentContext);
    const [data, setData] = useState<any>({});
    const [formData, setFormData] = useState<FormData>({});

    function setDatas() {
        if (context == null) {
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

    let contextStatic = buildStaticContext(context);

    useEffect(() => {
        if (context) {
            setDatas();
        }
    }, [
        props.dataOverride,
        props.formDataOverride,
        context,
        contextStatic.data,
        contextStatic.values,
    ]);
    if (isArray(props.renderer)) {
        return (
            <>
                {props.renderer.map((v) => (
                    <RenderItem {...props} renderer={v} />
                ))}
            </>
        );
    }

    setDatas();

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
        return (
            <SourceItem
                source={props.renderer}
                data={data}
                formData={formData}
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
        const fn = Renderers[props.renderer.type];
        return (
            <div className="rendered-item single">
                {fn ? (
                    fn(props.renderer, data, formData)
                ) : (
                    <Error
                        text={`Renderer type ${props.renderer.type} not found.`}
                    />
                )}
            </div>
        );
    }
}
