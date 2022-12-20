import * as React from "react";
import { useState, useEffect } from "react";
import { AllItems, ModularDocument, RawData } from "./types";
import { DocumentContext } from "./utility/document_communication";
import RenderItem from "./RenderItem";

export function ModularRenderer(props: {
    id: string;
    renderer: AllItems;
    data: RawData;
    formData?: { [key: string]: any };
    onFormDataChange?: (data: { [key: string]: any }) => void;
}) {
    const [formData, setFormData] = useState<{ [key: string]: any }>(
        props.formData ?? {}
    );
    const document: ModularDocument = {
        documentId: props.id,
        update: (field: string, value: any) => {
            if (value === null) {
                return;
            }
            let formCopy = JSON.parse(JSON.stringify(formData));
            formCopy[field] = value;
            setFormData(formCopy);
            props.onFormDataChange && props.onFormDataChange(formCopy);
        },
        values: formData,
        data: props.data,
    };

    useEffect(() => {
        props.formData && setFormData(props.formData);
    }, [props.formData]);
    return (
        <div className="modular-renderer" id={props.id}>
            <DocumentContext.Provider value={document}>
                <RenderItem renderer={props.renderer} />
            </DocumentContext.Provider>
        </div>
    );
}
