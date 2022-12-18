import * as React from "react";
import { useContext, useState, useEffect } from "react";
import { AllItems, FormData } from "./types";
import { isSourceItem } from "./types/guards";
import { DocumentContext } from "./utility/document_communication";
import { Renderers } from "./renderers";
import SourceItem from "./SourceItem";

export function Error(props: { text: string }): JSX.Element {
    return <div className="render-item child error">Error: {props.text}</div>;
}

export default function RenderItem(props: {
    renderer: AllItems;
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

    setDatas();
    if (context) {
        useEffect(setDatas, [
            props.dataOverride,
            props.formDataOverride,
            context,
            context.data,
            context.values,
        ]);
    }

    if (isSourceItem(props.renderer)) {
        return (
            <SourceItem
                source={props.renderer}
                data={data}
                formData={formData}
            />
        );
    } else {
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
