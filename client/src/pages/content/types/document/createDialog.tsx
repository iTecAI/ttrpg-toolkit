import {
    Autocomplete,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    TextField,
    Typography,
} from "@mui/material";
import { loc } from "../../../../util/localization";
import { useEffect, useState } from "react";
import { UniversalCreateForm } from "../../util";
import { get, post, postFile } from "../../../../util/api";
import { DocumentType } from "../../../../models/plugin";
import { Box } from "@mui/system";
import AbstractIcon from "../../../../util/AbstractIcon";
import "./style.scss";
import { MdViewQuilt } from "react-icons/md";

export function CreateDocumentDialog(props: {
    parent: string;
    open: boolean;
    setOpen: (open: boolean) => void;
}): JSX.Element {
    function close() {
        props.setOpen(false);
        setName("New Document");
        setImage(null);
        setTags([]);
        setSelectedTemplate(null);
    }

    const [name, setName] = useState<string>("New Document");
    const [image, setImage] = useState<File | null>(null);
    const [tags, setTags] = useState<string[]>([]);

    const [templates, setTemplates] = useState<{
        [key: string]: { [key: string]: DocumentType };
    }>({});

    type DocumentOption = {
        plugin: string;
        slug: string;
    };

    const [options, setOptions] = useState<DocumentOption[]>([]);

    useEffect(() => {
        get<{ [key: string]: { [key: string]: DocumentType } }>(
            "/plugins/all/documentTypes"
        ).then((result) => {
            if (result.success) {
                setTemplates(result.value);
            }
        });
    }, []);

    useEffect(() => {
        const newOptions: DocumentOption[] = [];
        for (let plugin of Object.keys(templates)) {
            if (templates[plugin]) {
                for (let slug of Object.keys(templates[plugin])) {
                    newOptions.push({
                        plugin,
                        slug,
                    });
                }
            }
        }
        setOptions(newOptions);
    }, [templates]);

    const [selectedTemplate, setSelectedTemplate] =
        useState<DocumentOption | null>(null);

    function submit() {
        if (name.length === 0) {
            return;
        }
        if (selectedTemplate === null) {
            return;
        }
        let createdImage: string | null = null;
        if (image) {
            postFile<{ itemId: string }>("/user_content/", {
                body: image,
            }).then((result) => {
                if (result.success) {
                    createdImage = result.value.itemId;
                }

                post("/content/document", {
                    urlParams: {
                        parent: props.parent,
                    },
                    body: {
                        name: name,
                        image: createdImage ?? undefined,
                        tags: tags,
                        data: {
                            plugin: selectedTemplate.plugin,
                            template: selectedTemplate.slug,
                        },
                    },
                }).then((result) => console.log(result));
            });
        } else {
            post("/content/document", {
                urlParams: {
                    parent: props.parent,
                },
                body: {
                    name: name,
                    image: createdImage ?? undefined,
                    tags: tags,
                    data: {
                        plugin: selectedTemplate.plugin,
                        template: selectedTemplate.slug,
                    },
                },
            }).then((result) => console.log(result));
        }

        close();
    }

    return (
        <Dialog open={props.open} onClose={close} maxWidth="md" fullWidth>
            <DialogTitle>{loc("content.document.create.title")}</DialogTitle>
            <DialogContent>
                <UniversalCreateForm
                    name={name}
                    setName={setName}
                    image={null}
                    setImage={setImage}
                    tags={tags}
                    setTags={setTags}
                />
                <Autocomplete
                    sx={{ marginTop: "16px" }}
                    options={options.sort(
                        (a, b) => -b.plugin.localeCompare(a.plugin)
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={loc("content.document.create.template")}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <>
                                        <InputAdornment position="start">
                                            <MdViewQuilt size={24} />
                                        </InputAdornment>
                                        {params.InputProps.startAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                    value={selectedTemplate}
                    onChange={(event, value) => setSelectedTemplate(value)}
                    getOptionLabel={(option) =>
                        templates[option.plugin][option.slug].displayName
                    }
                    groupBy={(option) => option.plugin}
                    renderOption={(props, option) => (
                        <Box component={"li"} {...props}>
                            <Box className="template-option">
                                <AbstractIcon
                                    type={
                                        templates[option.plugin][option.slug]
                                            .icon.type
                                    }
                                    name={
                                        templates[option.plugin][option.slug]
                                            .icon.name
                                    }
                                    className="option-icon"
                                />
                                <Typography variant="body1">
                                    {
                                        templates[option.plugin][option.slug]
                                            .displayName
                                    }
                                </Typography>
                            </Box>
                        </Box>
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={close}>
                    {loc("generic.cancel")}
                </Button>
                <Button variant="contained" onClick={submit}>
                    {loc("generic.submit")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
