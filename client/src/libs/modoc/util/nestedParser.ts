export default function parseNested(
    obj: any,
    keys: string | string[],
    new_val?: any
): any {
    if (typeof keys === "string") {
        keys = keys.split(".");
    }

    const key: string = keys[0];
    keys = keys.slice(1);
    try {
        if (Object.keys(obj).includes(key)) {
            if (keys.length === 0) {
                if (new_val !== undefined) {
                    obj[key] = new_val;
                }
                return obj[key];
            }
            return parseNested(obj[key], keys, new_val);
        } else {
            if (new_val !== undefined) {
                obj[key] = {};
                return parseNested(obj[key], keys, new_val);
            }
            console.warn(
                `Attempt to access key ${key} of ${JSON.stringify(obj)} failed.`
            );
            return null;
        }
    } catch {
        if (new_val !== undefined) {
            obj[key] = {};
            return parseNested(obj[key], keys, new_val);
        }
        console.warn(
            `Attempt to access key ${key} of ${JSON.stringify(obj)} failed.`
        );
        return null;
    }
}
