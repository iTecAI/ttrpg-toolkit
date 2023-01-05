import * as React from "react";
import { useState, useEffect } from "react";
import { AllItems, ModularDocument, RawData } from "./types";
import { DocumentContext } from "./utility/document_communication";
import RenderItem from "./RenderItem";

export function ModularRenderer(props: {
    /** Document ID */
    id: string;
    /** Renderer Specification (either a RenderItem or SourceItem) */
    renderer: AllItems;
    /** Static data (not user-modified) */
    data: RawData;
    /** Form data, can be used as a control */
    formData?: { [key: string]: any };
    /** Function to update on form data change */
    onFormDataChange?: (data: { [key: string]: any }) => void;
    /** Whether to disable form inputs */
    disabled?: boolean;
}) {
    const [formData, setFormData] = useState<{ [key: string]: any }>(
        props.formData ?? {}
    );
    const [doc, setDoc] = useState<ModularDocument>({
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
        disabled: props.disabled ?? false,
    });

    useEffect(() => {
        if (
            JSON.stringify(props.formData) !== JSON.stringify(doc.values) ||
            JSON.stringify(props.data) !== JSON.stringify(doc.data) ||
            props.disabled !== doc.disabled
        ) {
            setDoc({
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
                disabled: props.disabled ?? false,
            });
        }
    }, [props.formData, props.data, props.disabled]);

    useEffect(
        () => props.formData && setFormData(props.formData),
        [props.formData]
    );
    return (
        <div className="modular-renderer" id={props.id}>
            <DocumentContext.Provider value={doc}>
                <RenderItem renderer={props.renderer} />
            </DocumentContext.Provider>
        </div>
    );
}
