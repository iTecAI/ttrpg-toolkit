import {
    Autocomplete,
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import {
    MinimalContentType,
    SharePermission,
    ShareType,
} from "../../../models/content";
import { loc } from "../../../util/localization";
import { useContext, useEffect, useState } from "react";
import { UserInfoModel, UserSearchResult } from "../../../models/account";
import {
    MdCheckBoxOutlineBlank,
    MdCheckBox,
    MdStar,
    MdClear,
    MdHorizontalRule,
    MdCheck,
} from "react-icons/md";
import { calculateGravatar } from "../../../util/gravatar";
import { del, get, post } from "../../../util/api";
import "./share.scss";
import { Box } from "@mui/system";
import { UserContext } from "../../../App";
import { useUpdate } from "../../../util/updates";

function SharePermissionRender(props: {
    share: ShareType;
    permission: keyof SharePermission;
    item: MinimalContentType;
}): JSX.Element {
    const { share, permission } = props;
    const [value, setValue] = useState<"active" | "inherit" | "inactive">(
        "inactive"
    );

    useEffect(() => {
        const val = share.explicit[permission];
        if (val === true) {
            setValue("active");
        } else if (val === null) {
            setValue("inherit");
        } else {
            setValue("inactive");
        }
    }, [share.explicit, permission]);

    return (
        <Stack spacing={2} className="permission-item" direction="row">
            <Typography variant="overline" className="perm-name">
                {loc(
                    `content.universal.dialogs.share.permissions.${permission}`
                )}
            </Typography>
            <ToggleButtonGroup
                value={
                    share.implicit[permission] === true
                        ? "active"
                        : share.implicit[permission] === null
                        ? "inherit"
                        : "inactive"
                }
                exclusive
                className="perm-buttons-implicit"
                size="small"
            >
                <ToggleButton value="inactive" color="error">
                    <MdClear size={24} />
                </ToggleButton>
                <ToggleButton value="inherit" color="standard">
                    <MdHorizontalRule size={24} />
                </ToggleButton>
                <ToggleButton value="active" color="success">
                    <MdCheck size={24} />
                </ToggleButton>
            </ToggleButtonGroup>
            <ToggleButtonGroup
                value={value}
                exclusive
                onChange={(event, eventVal) => {
                    setValue(eventVal);
                    const map: { [key: string]: boolean | null } = {
                        active: true,
                        inherit: null,
                        inactive: false,
                    };
                    const toShare: { [key: string]: boolean | null } = {};
                    toShare[props.permission] = map[eventVal];
                    post(`/content/${props.item.oid}/shared`, {
                        body: [
                            {
                                user: props.share.uid,
                                shares: toShare,
                            },
                        ],
                    });
                }}
                className="perm-buttons"
                size="small"
            >
                <ToggleButton value="inactive" color="error">
                    <MdClear size={24} />
                </ToggleButton>
                <ToggleButton value="inherit" color="standard">
                    <MdHorizontalRule size={24} />
                </ToggleButton>
                <ToggleButton value="active" color="success">
                    <MdCheck size={24} />
                </ToggleButton>
            </ToggleButtonGroup>
        </Stack>
    );
}

function ShareItem(props: {
    share: ShareType;
    item: MinimalContentType;
}): JSX.Element {
    const [user, setUser] = useState<UserInfoModel | null>(null);
    const me = useContext(UserContext);

    useEffect(() => {
        get<UserInfoModel>(`/account/${props.share.uid}`).then((result) => {
            if (result.success) {
                setUser(result.value);
            }
        });
    }, [props.share]);

    return user ? (
        <Card className="share-item">
            <CardHeader
                title={user.displayName}
                subheader={user.username}
                avatar={
                    <Avatar
                        component="image"
                        src={calculateGravatar(user.username, 128)}
                        alt=""
                    />
                }
            />
            {props.share.owner ? (
                <Paper className="owner" variant="outlined">
                    <MdStar size={24} />
                    <Typography className="text" variant="overline">
                        {loc("content.universal.dialogs.share.owner")}
                    </Typography>
                </Paper>
            ) : (
                <IconButton
                    className="remove-share"
                    color="error"
                    onClick={() =>
                        del<null>(
                            `/content/${props.item.oid}/shared/${props.share.uid}`
                        )
                    }
                >
                    <MdClear size={24} />
                </IconButton>
            )}
            {props.share.owner ? (
                <Box sx={{ paddingBottom: "8px" }} />
            ) : (
                <CardContent>
                    <Grid container spacing={2} className="permission-grid">
                        {me && props.item.owner === me.userId && (
                            <Grid item xs={12}>
                                <SharePermissionRender
                                    share={props.share}
                                    permission={"admin"}
                                    item={props.item}
                                />
                            </Grid>
                        )}
                        {props.item.shared.view &&
                            !props.share.implicit.admin && (
                                <Grid item xs={12} md={6}>
                                    <SharePermissionRender
                                        share={props.share}
                                        permission={"view"}
                                        item={props.item}
                                    />
                                </Grid>
                            )}
                        {props.item.shared.edit &&
                            !props.share.implicit.admin && (
                                <Grid item xs={12} md={6}>
                                    <SharePermissionRender
                                        share={props.share}
                                        permission={"edit"}
                                        item={props.item}
                                    />
                                </Grid>
                            )}
                        {props.item.shared.share &&
                            !props.share.implicit.admin && (
                                <Grid item xs={12} md={6}>
                                    <SharePermissionRender
                                        share={props.share}
                                        permission={"share"}
                                        item={props.item}
                                    />
                                </Grid>
                            )}
                        {props.item.shared.delete &&
                            !props.share.implicit.admin && (
                                <Grid item xs={12} md={6}>
                                    <SharePermissionRender
                                        share={props.share}
                                        permission={"delete"}
                                        item={props.item}
                                    />
                                </Grid>
                            )}
                    </Grid>
                </CardContent>
            )}
        </Card>
    ) : (
        <Card className="share-item">
            <CircularProgress />
        </Card>
    );
}

export function ShareDialog(props: {
    item: MinimalContentType;
    open: boolean;
    setOpen: (open: boolean) => void;
}): JSX.Element {
    function close() {
        props.setOpen(false);
    }

    const [users, setUsers] = useState<UserSearchResult[]>([]);
    const [value, setValue] = useState<UserSearchResult[]>([]);
    const [inputValue, setInputValue] = useState<string>("");

    useEffect(() => {
        if (inputValue.length > 2) {
            get<UserSearchResult[]>("/account/search", {
                urlParams: { q: inputValue },
            }).then((result) => {
                if (result.success) {
                    setUsers(result.value);
                }
            });
        } else if (inputValue.length === 0) {
            setUsers([]);
        }
    }, [inputValue]);

    const [shared, setShared] = useState<ShareType[]>([]);

    useEffect(() => {
        get<ShareType[]>(`/content/${props.item.oid}/shared`).then((result) => {
            if (result.success) {
                console.log(result.value);
                setShared(result.value);
            }
        });
    }, [props.item]);

    useUpdate((update) => {
        get<ShareType[]>(`/content/${props.item.oid}/shared`).then((result) => {
            if (result.success) {
                console.log(result.value);
                setShared(result.value);
            }
        });
    }, `content.share.${props.item.oid}`);

    useEffect(() => {
        if (
            props.item.shared.share === false ||
            props.item.shared.view === false
        ) {
            close();
        }
    }, [props.item.shared]);

    return (
        <Dialog
            className="content-share-dialog"
            open={props.open}
            onClose={close}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                {loc("content.universal.dialogs.share.title")}
            </DialogTitle>
            <DialogContent>
                <Autocomplete
                    className="user-search"
                    multiple
                    inputValue={inputValue}
                    value={value as any}
                    onChange={(event, value) => setValue(value as any)}
                    onInputChange={(event, value) => setInputValue(value)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            label={loc("content.universal.dialogs.share.input")}
                        />
                    )}
                    options={users}
                    getOptionLabel={(option: UserSearchResult) =>
                        `${option.display} (${option.email})`
                    }
                    renderTags={(value: UserSearchResult[], getTagProps) =>
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
                                    <Avatar src={calculateGravatar(v.email)} />
                                }
                                {...getTagProps({ index })}
                            />
                        ))
                    }
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                icon={<MdCheckBoxOutlineBlank size={24} />}
                                checkedIcon={<MdCheckBox size={24} />}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            <Stack direction={"row"} spacing={1}>
                                <Avatar
                                    src={calculateGravatar(option.email)}
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
                <IconButton
                    className="confirm-btn"
                    color="success"
                    onClick={() => {
                        if (value.length > 0) {
                            post(`/content/${props.item.oid}/shared`, {
                                body: value.map((u) => {
                                    return {
                                        user: u.uid,
                                        shares: { view: true },
                                    };
                                }),
                            });
                            setValue([]);
                        }
                    }}
                >
                    <MdCheck size={24} />
                </IconButton>
                <Stack className="share-item-container" spacing={2}>
                    {shared.map((v) => (
                        <ShareItem share={v} item={props.item} key={v.uid} />
                    ))}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
