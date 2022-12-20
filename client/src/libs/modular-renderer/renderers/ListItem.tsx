import { RendererFunction, RendererFunctionProps } from ".";
import RenderItem from "../RenderItem";
import { RenderListItem } from "../types/renderTypes";
import { expandItems } from "../utility/parsers";

export const ListItem: RendererFunction<RenderListItem> = (
    props: RendererFunctionProps<RenderListItem>
) => {
    const { renderer, data, formData } = props;
    const children = expandItems(renderer.children ?? [], data, formData);
    const markers = renderer.itemMarkers ?? {
        ordered: false,
        style: "circle",
    };
    if (markers.ordered) {
        return (
            <ul
                className="render-item child list"
                style={{ listStyleType: markers.style }}
            >
                {children.map((c) => (
                    <li className="render-item child list-item">
                        <RenderItem
                            renderer={c.renderer}
                            dataOverride={c.data}
                            formDataOverride={formData}
                        />
                    </li>
                ))}
            </ul>
        );
    } else {
        return (
            <ol
                className="render-item child list"
                style={{ listStyleType: markers.style }}
            >
                {children.map((c) => (
                    <li className="render-item child list-item">
                        <RenderItem
                            renderer={c.renderer}
                            dataOverride={c.data}
                            formDataOverride={formData}
                        />
                    </li>
                ))}
            </ol>
        );
    }
};
