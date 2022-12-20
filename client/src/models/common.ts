import { ValueItem } from "../libs/modular-renderer/types";

export type IconFamily = "md" | "gi";

export type IconType =
    | {
          family: IconFamily;
          name: string | ValueItem;
      }
    | string
    | ValueItem;
