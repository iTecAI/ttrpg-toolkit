import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import {
    Context,
    createContext,
    useReducer,
    ReactNode,
    useContext,
    useState,
    useEffect,
} from "react";
import { loc } from "./localization";
import { Md5 } from "ts-md5";

export type DialogContextOptions = {
    title: string;
    content?: ReactNode;
    buttons: {
        id: string;
        text: string;
        color?: "primary" | "secondary" | "info" | "error" | "success";
        variant?: "outlined" | "contained";
        action?: (id: string, initializer: any) => void;
    }[];
};

export type DialogContextType = {
    create: (id: string, options: DialogContextOptions) => void;
    trigger: (id: string, init: any) => void;
    destroy: (id: string) => void;
};

export const DialogContext: Context<DialogContextType> =
    createContext<DialogContextType>({
        create(id, options) {},
        trigger(id, init) {},
        destroy(id) {},
    });

export function DialogProvider(props: { children: ReactNode }): JSX.Element {
    function reduce(
        state: { [key: string]: [DialogContextOptions, boolean, any] },
        action:
            | { type: "create"; id: string; options: DialogContextOptions }
            | { type: "hide"; id: string }
            | { type: "destroy"; id: string }
            | { type: "activate"; id: string; initializer: any }
    ): { [key: string]: [DialogContextOptions, boolean, any] } {
        let newState: { [key: string]: [DialogContextOptions, boolean, any] };
        switch (action.type) {
            case "create":
                newState = { ...state };
                newState[action.id] = [action.options, false, null];
                return newState;
            case "hide":
                newState = { ...state };
                if (Object.keys(newState).includes(action.id)) {
                    newState[action.id][1] = false;
                }
                return newState;
            case "activate":
                newState = { ...state };
                if (Object.keys(newState).includes(action.id)) {
                    newState[action.id][1] = true;
                    newState[action.id][2] = action.initializer;
                }
                return newState;
            case "destroy":
                newState = { ...state };
                if (Object.keys(newState).includes(action.id)) {
                    delete newState[action.id];
                }
                return newState;
        }
    }

    const [dialogs, dispatch] = useReducer(reduce, {});

    return (
        <DialogContext.Provider
            value={{
                create(id, options) {
                    dispatch({ type: "create", id, options });
                },
                trigger(id, init) {
                    dispatch({ type: "activate", id, initializer: init });
                },
                destroy(id) {
                    dispatch({ type: "destroy", id });
                },
            }}
        >
            {props.children}
            <>
                {Object.keys(dialogs).map((id: string) => {
                    const [options, open, init] = dialogs[id];
                    return (
                        <Dialog
                            key={id}
                            open={open}
                            onClose={() =>
                                dispatch({
                                    type: "hide",
                                    id: id,
                                })
                            }
                        >
                            <DialogTitle>{options.title}</DialogTitle>
                            <DialogContent>{options.content}</DialogContent>

                            <DialogActions>
                                {options.buttons.length > 0 ? (
                                    options.buttons.map((b) => (
                                        <Button
                                            key={b.id}
                                            color={b.color ?? "primary"}
                                            variant={b.variant ?? "contained"}
                                            onClick={() => {
                                                b.action &&
                                                    b.action(b.id, init);
                                                dispatch({ type: "hide", id });
                                            }}
                                        >
                                            {b.text}
                                        </Button>
                                    ))
                                ) : (
                                    <Button variant="contained">
                                        {loc("generic.close")}
                                    </Button>
                                )}
                            </DialogActions>
                        </Dialog>
                    );
                })}
            </>
        </DialogContext.Provider>
    );
}

export function useDialog(options: DialogContextOptions): (init: any) => void {
    const { create, trigger, destroy } = useContext(DialogContext);
    const [id, setId] = useState<string>("");

    useEffect(() => {
        const _id = Md5.hashStr(Math.random().toString());
        create(_id, options);
        setId(_id);
        return destroy(id);
    }, []);

    return (init: any) => trigger(id, init);
}
