import { locales } from "../localization";

function getLocaleValue(
    current: any,
    keys: string[]
): { [key: string]: any } | string {
    if (keys.length === 0) {
        return current;
    } else {
        if (Object.keys(current).includes(keys[0])) {
            return getLocaleValue(current[keys[0]], keys.slice(1));
        } else {
            console.warn(`Localization failed @ key "${keys[0]}"`);
            return `Localization failed @ key "${keys[0]}"`;
        }
    }
}

export function loc(key: string, vars?: { [key: string]: string }): string {
    let locale = window.localStorage.getItem("app-locale");
    if (!locale) {
        locale = "en";
    }

    let rawValue: string | string[] = getLocaleValue(
        locales[locale],
        key.split(".")
    ) as string | string[];

    let value: string;
    if ((rawValue as string[]).push !== undefined) {
        value = (rawValue as string[]).join("\n");
    } else {
        value = rawValue as string;
    }

    if (vars) {
        for (let v of Object.keys(vars)) {
            value = value.replaceAll("{{" + v + "}}", vars[v]);
        }
    }

    for (let v of Object.keys(locales.__vars__)) {
        value = value.replaceAll("{{" + v + "}}", locales.__vars__[v]);
    }

    return value;
}
