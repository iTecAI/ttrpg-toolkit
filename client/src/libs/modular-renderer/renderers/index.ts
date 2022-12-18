import { AllRenderItems, RawData } from "../types";

export const Renderers: {
    [key: string]: (
        renderer: AllRenderItems,
        data: RawData,
        formData: { [key: string]: any }
    ) => JSX.Element;
} = {};
