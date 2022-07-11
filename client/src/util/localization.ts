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

export function loc(key: string): string {
    let locale = window.localStorage.getItem("app-locale");
    if (!locale) {
        locale = "en";
    }

    let value: string = getLocaleValue(
        locales[locale],
        key.split(".")
    ) as string;

    for (let v of Object.keys(locales.__vars__)) {
        value = value.replaceAll("{{" + v + "}}", locales.__vars__[v]);
    }

    return value;
}
