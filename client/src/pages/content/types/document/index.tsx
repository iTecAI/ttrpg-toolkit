import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { DocumentItemType } from "../../../../models/content";
import { get } from "../../../../util/api";
import { ExpandedContentType } from "../../../../models/content";
import { DocumentType } from "../../../../models/plugin";
import { Chip, Paper, Typography } from "@mui/material";
import AbstractIcon from "../../../../util/AbstractIcon";
import "./index.scss";
import { ModularRenderer } from "../../../../libs/modular-renderer";

export function DocumentTypeRenderer(props: { itemId: string }): JSX.Element {
    const [doc, setDoc] =
        useState<ExpandedContentType<DocumentItemType> | null>(null);

    const [template, setTemplate] = useState<DocumentType | null>(null);

    const [form, setForm] = useState<{ [key: string]: any }>({});

    useEffect(() => {
        get<ExpandedContentType<DocumentItemType>>(
            `/content/specific/${props.itemId}`
        ).then((result) => {
            if (result.success) {
                setDoc(result.value);
                setForm(result.value.data.contents);
            }
        });
    }, [props.itemId]);

    useEffect(() => {
        if (doc) {
            get<DocumentType>(`/plugins/${doc.data.plugin}`, {
                urlParams: { path: `documentTypes.${doc.data.template}` },
            }).then((result) => {
                if (result.success) {
                    setTemplate(result.value);
                }
            });
        }
    }, [doc]);

    useEffect(() => {
        console.log(form);
    }, [form]);

    return (
        <Box className="document-container">
            {template && doc && (
                <>
                    <Paper className="header" elevation={0}>
                        <AbstractIcon
                            type={template.icon.type}
                            name={template.icon.name}
                            className="header-icon"
                        />
                        <Typography className="title" variant="h5">
                            {doc.name}
                        </Typography>
                        <Chip
                            variant="outlined"
                            label={template.displayName}
                            className="type"
                            size="small"
                        />
                    </Paper>
                    <Box className="render-area">
                        <ModularRenderer
                            id="document-renderer"
                            renderer={template.form}
                            data={{}}
                            formData={form}
                            onFormDataChange={setForm}
                        />
                    </Box>
                </>
            )}
        </Box>
    );
}

export function DocumentTypePage(): JSX.Element {
    const current = useParams().current ?? "";
    return <DocumentTypeRenderer itemId={current} />;
}
