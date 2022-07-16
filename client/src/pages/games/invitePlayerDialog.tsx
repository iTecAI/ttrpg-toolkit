import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { MdCopyAll } from "react-icons/md";
import { InviteModel, MinimalGame } from "../../models/game";
import { del, patch, post } from "../../util/api";
import { loc } from "../../util/localization";
import "./styles/invite.scss";

export function InvitePlayerDialog(props: {
    game: MinimalGame | null;
    open: boolean;
    handleClose: () => void;
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [inviteCode, setInviteCode] = useState<InviteModel | null>(null);

    const [expirationValue, setExpirationValue] = useState<Date | null>(null);
    const [usesValue, setUsesValue] = useState<number | null>(null);

    const { enqueueSnackbar } = useSnackbar();

    function handleClose(confirm: boolean) {
        if (confirm) {
            patch<InviteModel>(
                `/games/${props.game?.id}/invites/${inviteCode?.code}`,
                {
                    body: {
                        uses_remaining: usesValue,
                        expiration: expirationValue
                            ? Math.round(expirationValue.getTime() / 1000)
                            : null,
                    },
                }
            );
        } else {
            del(`/games/${props.game?.id}/invites/${inviteCode?.code}`);
        }
        props.handleClose();
    }

    useEffect(() => {
        setLoading(true);
        if (props.game) {
            post<InviteModel>("/games/" + props.game.id + "/invites", {
                body: {
                    use_limit: 1,
                    expire_length: 7 * 24 * 60 * 60, // Expire in 7 days
                },
            }).then((result) => {
                setLoading(false);
                if (result.success) {
                    setInviteCode(result.value);
                    setExpirationValue(
                        result.value.expiration
                            ? new Date(result.value.expiration * 1000)
                            : null
                    );
                    setUsesValue(
                        result.value.uses_remaining
                            ? result.value.uses_remaining
                            : null
                    );
                }
            });
        }
    }, [props.open, props.game]);

    return (
        <Dialog
            fullWidth={!loading}
            open={props.open}
            className={"invite-dialog" + (loading ? " loading" : "")}
            onClose={() => handleClose(false)}
        >
            {loading ? (
                <DialogContent>
                    <span className="invite-loading">
                        <CircularProgress size={48} />
                    </span>
                </DialogContent>
            ) : props.game ? (
                <>
                    <DialogTitle>
                        {loc("games.main.invite_dialog.title")}
                    </DialogTitle>
                    <DialogContent>
                        <Stack spacing={2}>
                            <Paper className="invite-code-display">
                                <span className="code-text">
                                    {inviteCode && inviteCode.code}
                                </span>
                                {window.isSecureContext ? (
                                    <IconButton
                                        className="copy-button"
                                        onClick={() => {
                                            if (inviteCode) {
                                                window.navigator.clipboard.writeText(
                                                    inviteCode.code
                                                );
                                                enqueueSnackbar(
                                                    loc("generic.copied"),
                                                    {
                                                        autoHideDuration: 3000,
                                                        variant: "success",
                                                    }
                                                );
                                            }
                                        }}
                                    >
                                        <MdCopyAll size={24} />
                                    </IconButton>
                                ) : null}
                            </Paper>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label={loc(
                                        "games.main.invite_dialog.expiration"
                                    )}
                                    value={expirationValue}
                                    onChange={(value) =>
                                        setExpirationValue(value)
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} fullWidth />
                                    )}
                                />
                            </LocalizationProvider>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label={loc("games.main.invite_dialog.uses")}
                                value={usesValue}
                                onChange={(event) => {
                                    if (event.target.value.length === 0) {
                                        setUsesValue(null);
                                    } else if (
                                        /^[0-9]*$/.test(event.target.value)
                                    ) {
                                        setUsesValue(
                                            Number(event.target.value)
                                        );
                                    }
                                }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="outlined"
                            onClick={() => handleClose(false)}
                        >
                            {loc("generic.cancel")}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => handleClose(true)}
                        >
                            {loc("generic.finish")}
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <></>
            )}
        </Dialog>
    );
}
