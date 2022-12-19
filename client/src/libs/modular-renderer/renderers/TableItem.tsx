import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import { RendererFunction, RendererFunctionProps } from ".";
import RenderItem from "../RenderItem";
import { FormData, ValueItem } from "../types";
import { RenderTableItem, RenderTableRowItem } from "../types/renderTypes";
import {
    ExpandedRenderItem,
    expandItems,
    parseValueItem,
} from "../utility/parsers";
import { useValueItem } from "../utility/hooks";

export function TableHeadCell(props: {
    item: ValueItem;
    data: any;
}): JSX.Element {
    const val = useValueItem(props.item, props.data);
    return (
        <TableCell className="table-cell" key={Math.random()}>
            {val}
        </TableCell>
    );
}

export const TableItem: RendererFunction<RenderTableItem> = (
    props: RendererFunctionProps<RenderTableItem>
) => {
    const { renderer, data, formData } = props;
    const headers = renderer.headers ?? [];
    const children = renderer.children ?? [];
    return (
        <Table className="render-item child table">
            <TableHead>
                <TableRow className="table-header">
                    {headers.map((v: ValueItem) => (
                        <TableHeadCell item={v} data={data} />
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                <RenderItem
                    renderer={children}
                    dataOverride={data}
                    formDataOverride={formData}
                />
            </TableBody>
        </Table>
    );
};

export const TableRowItem: RendererFunction<RenderTableRowItem> = (
    props: RendererFunctionProps<RenderTableRowItem>
) => {
    const { renderer, data, formData } = props;
    const children = expandItems(renderer.children ?? [], data, formData);
    return (
        <div className="render-item child table-row">
            <TableRow className="table-row">
                {children.map(
                    (cell: ExpandedRenderItem | null) =>
                        cell && (
                            <TableCell
                                className="table-cell"
                                key={Math.random()}
                            >
                                <RenderItem
                                    renderer={cell.renderer}
                                    dataOverride={cell.data}
                                    formDataOverride={formData}
                                />
                            </TableCell>
                        )
                )}
            </TableRow>
        </div>
    );
};
