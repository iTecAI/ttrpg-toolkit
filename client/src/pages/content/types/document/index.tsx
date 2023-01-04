import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { DocumentItemType } from "../../../../models/content";
import { get, post } from "../../../../util/api";
import { ExpandedContentType } from "../../../../models/content";
import { DocumentType } from "../../../../models/plugin";
import { Chip, Fab, Paper, Typography } from "@mui/material";
import AbstractIcon from "../../../../util/AbstractIcon";
import "./index.scss";
import { ModularRenderer } from "../../../../libs/modular-renderer";
import { useUpdate } from "../../../../util/updates";
import { MdSave } from "react-icons/md";

export function DocumentTypeRenderer(props: { itemId: string }): JSX.Element {
    const [doc, setDoc] =
        useState<ExpandedContentType<DocumentItemType> | null>(null);

    const [template, setTemplate] = useState<DocumentType | null>(null);

    const [form, setForm] = useState<{ [key: string]: any }>({});
    const [updateName, setUpdateName] = useState<string>("");

    useEffect(() => {
        setUpdateName(`content.update.${props.itemId}`);
    }, [props.itemId]);

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

    useUpdate((update) => {
        get<ExpandedContentType<DocumentItemType>>(
            `/content/specific/${props.itemId}`
        ).then((result) => {
            if (result.success) {
                setDoc(result.value);
                setForm(result.value.data.contents);
            }
        });
    }, updateName);

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
                        {doc.shared.edit && (
                            <Fab
                                color="primary"
                                className="save-btn"
                                size="small"
                                onClick={() => {
                                    post<ExpandedContentType<DocumentItemType>>(
                                        `/content_types/documents/${doc.oid}/update`,
                                        { body: form }
                                    ).then(console.log);
                                }}
                            >
                                <MdSave size={20} />
                            </Fab>
                        )}
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
