import {
    Autocomplete,
    Avatar,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import { loc } from "../../../util/localization";
import { useEffect, useState } from "react";
import { UserSearchResult } from "../../../models/account";
import { get } from "../../../util/api";
import { calculateGravatar } from "../../../util/gravatar";
import { MdCheckBox, MdCheckBoxOutlineBlank, MdSend } from "react-icons/md";
import {
    MinimalCollection,
    ShareCollectionItem,
} from "../../../models/collection";
import "./share.scss";
import { Box } from "@mui/system";

const PERMISSIONS: { [key: string]: string } = {
    owner: "#8f49b3",
    promoter: "#972a2a",
    admin: "#972a2a",
    configure: "#a34710",
    share: "#a34710",
    delete: "#a34710",
    create: "#32712c",
    edit: "#32712c",
    read: "#32712c",
};

function SharedItem(props: {
    item: ShareCollectionItem;
    collection: MinimalCollection;
}): JSX.Element {
    const { item, collection } = props;
    const [perms, setPerms] = useState<string[]>([]);

    useEffect(() => setPerms(item.permissions), [item]);

    return (
        <Paper className="shared-item" variant={"elevation"} elevation={2}>
            {item.shareType === "user" ? (
                <Box className="item-user">
                    <Avatar
                        src={calculateGravatar(item.imageSrc)}
                        className="user-icon"
                    />
                    <Stack spacing={1} className="user-content">
                        <Typography variant="h5">{item.name}</Typography>
                        <Select
                            fullWidth
                            multiple
                            value={perms}
                            onChange={(event) =>
                                setPerms(
                                    (event.target.value as string[]).sort(
                                        (a, b) =>
                                            Object.keys(PERMISSIONS).indexOf(
                                                a
                                            ) -
                                            Object.keys(PERMISSIONS).indexOf(b)
                                    )
                                )
                            }
                            renderValue={(selected) => (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                    }}
                                >
                                    {selected.map((v) => (
                                        <Tooltip
                                            title={loc(
                                                `collections.permissions.${v}.help`
                                            )}
                                            key={v}
                                        >
                                            <Chip
                                                sx={{
                                                    backgroundColor:
                                                        PERMISSIONS[v] + "88",
                                                }}
                                                label={loc(
                                                    `collections.permissions.${v}.name`
                                                )}
                                                size="small"
                                            />
                                        </Tooltip>
                                    ))}
                                </Box>
                            )}
                        >
                            {Object.keys(PERMISSIONS).map((p) =>
                                p === "owner" ? null : (
                                    <MenuItem
                                        key={p}
                                        value={p}
                                        disabled={
                                            (p === "promoter" &&
                                                !collection.permissions.includes(
                                                    "owner"
                                                )) ||
                                            (p === "admin" &&
                                                !collection.permissions.includes(
                                                    "promoter"
                                                )) ||
                                            (p === "configure" &&
                                                !collection.permissions.includes(
                                                    "configure"
                                                ))
                                        }
                                    >
                                        <Checkbox checked={perms.includes(p)} />
                                        <Stack spacing={0.25}>
                                            <span>
                                                {loc(
                                                    `collections.permissions.${p}.name`
                                                )}
                                            </span>
                                            <span style={{ opacity: 0.5 }}>
                                                {loc(
                                                    `collections.permissions.${p}.help`
                                                )}
                                            </span>
                                        </Stack>
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </Stack>
                </Box>
            ) : (
                <></>
            )}
        </Paper>
    );
}

export function ShareCollectionDialog(props: {
    collection: MinimalCollection;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [options, setOptions] = useState<UserSearchResult[]>([]);
    const [value, setValue] = useState<UserSearchResult[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const [shared, setShared] = useState<ShareCollectionItem[]>([]);

    useEffect(() => {
        if (inputValue.length > 4) {
            get<UserSearchResult[]>("/account/search", {
                urlParams: { q: inputValue },
            }).then((result) => {
                if (result.success) {
                    setOptions(result.value);
                }
            });
        }
    }, [inputValue]);

    useEffect(() => {
        get<ShareCollectionItem[]>(
            `/collections/${props.collection.collectionId}/shared`
        ).then((result) => {
            if (result.success) {
                setShared(result.value);
            }
        });
    }, []);

    function close() {
        setOptions([]);
        setInputValue("");
        setValue([]);
        props.setOpen(false);
    }

    return (
        <Dialog
            className="share-collection"
            open={props.open}
            onClose={close}
            fullWidth
            maxWidth={"md"}
        >
            <DialogTitle>
                {loc("collections.list.item.share.title")}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <Stack
                        spacing={2}
                        direction={"row"}
                        sx={{
                            width: "100%",
                            display: "inline-block",
                        }}
                    >
                        <Autocomplete
                            sx={{
                                width: "calc(100% - 128px)",
                                display: "inline-block",
                            }}
                            multiple
                            inputValue={inputValue}
                            value={value as any}
                            onChange={(event, value) => setValue(value as any)}
                            onInputChange={(event, value) =>
                                setInputValue(value)
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={loc(
                                        "collections.list.item.share.input"
                                    )}
                                    placeholder={loc(
                                        "collections.list.item.share.input-placeholder"
                                    )}
                                />
                            )}
                            options={options}
                            getOptionLabel={(option: UserSearchResult) =>
                                `${option.display} (${option.email})`
                            }
                            renderTags={(
                                value: UserSearchResult[],
                                getTagProps
                            ) =>
                                value.map((v, index) => (
                                    <Chip
                                        variant="filled"
                                        label={
                                            <Stack
                                                direction={"row"}
                                                spacing={0.75}
                                                sx={{ paddingTop: "4px" }}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        display: "inline",
                                                    }}
                                                >
                                                    {v.display}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: "inline",
                                                        paddingTop: "1px",
                                                        opacity: 0.75,
                                                    }}
                                                >
                                                    ({v.email})
                                                </Typography>
                                            </Stack>
                                        }
                                        avatar={
                                            <Avatar
                                                src={calculateGravatar(v.email)}
                                            />
                                        }
                                        {...getTagProps({ index })}
                                    />
                                ))
                            }
                            renderOption={(props, option, { selected }) => (
                                <li {...props}>
                                    <Checkbox
                                        icon={
                                            <MdCheckBoxOutlineBlank size={24} />
                                        }
                                        checkedIcon={<MdCheckBox size={24} />}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    <Stack direction={"row"} spacing={1}>
                                        <Avatar
                                            src={calculateGravatar(
                                                option.email
                                            )}
                                            sx={{ width: 24, height: 24 }}
                                        />
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                display: "inline",
                                                paddingTop: "5px",
                                            }}
                                        >
                                            {option.display}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                display: "inline",
                                                paddingTop: "6px",
                                                opacity: 0.75,
                                                verticalAlign: "middle",
                                            }}
                                        >
                                            ({option.email})
                                        </Typography>
                                    </Stack>
                                </li>
                            )}
                        />
                        <Button
                            startIcon={<MdSend />}
                            className="share-btn"
                            sx={{
                                width: "112px",
                                height: "48px",
                                transform: "translate(0, 16px)",
                                display: "inline-block",
                            }}
                            variant="contained"
                        >
                            <span className="text">{loc("generic.share")}</span>
                        </Button>
                    </Stack>
                    <Divider variant="middle" />
                    <Stack spacing={2}>
                        {shared.map((v) => (
                            <SharedItem
                                item={v}
                                key={v.oid}
                                collection={props.collection}
                            />
                        ))}
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
