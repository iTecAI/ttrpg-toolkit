export default function parseNested(obj: any, keys: string | string[]): any {
    if (typeof keys === "string") {
        keys = keys.split(".");
    }

    const key: string = keys[0];
    keys = keys.slice(1);
    try {
        if (Object.keys(obj).includes(key)) {
            if (keys.length === 0) {
                return obj[key];
            }
            return parseNested(obj[key], keys);
        } else {
            console.warn(
                `Attempt to access key ${key} of ${JSON.stringify(obj)} failed.`
            );
            return null;
        }
    } catch {
        console.warn(
            `Attempt to access key ${key} of ${JSON.stringify(obj)} failed.`
        );
        return null;
    }
}
