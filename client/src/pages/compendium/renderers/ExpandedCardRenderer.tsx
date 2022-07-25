import {
    Dialog,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import { CardExpandedModel, DataItem } from "../../../models/compendium";
import ModularRenderer from "./ModularRenderer";
import { renderText } from "./renderUtils";
import "../expanded_renderer.scss";

export function ExpandedCardRenderer(props: {
    renderer: CardExpandedModel;
    data: DataItem | null;
    onClose: () => void;
}) {
    const { renderer, data, onClose } = props;
    return (
        <Dialog
            className="expanded-item-dialog"
            open={data !== null}
            onClose={() => onClose()}
            scroll="paper"
            maxWidth="xl"
        >
            <DialogTitle>
                <span className="expanded-card-title">
                    {renderText(data ?? {}, renderer.title)}
                </span>
                <span className="expanded-card-subtitle">
                    {renderer.subtitle &&
                        renderText(data ?? {}, renderer.subtitle)}
                </span>
            </DialogTitle>
            <DialogContent dividers={true}>
                <Stack spacing={2}>
                    {data &&
                        renderer.contents.map((v) => (
                            <ModularRenderer
                                data={data}
                                item={v}
                                key={Math.random()}
                            />
                        ))}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
