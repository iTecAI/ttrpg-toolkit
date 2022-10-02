(opts) => {
    var out = [];
    if (typeof opts.speed === "object") {
        Object.keys(opts.speed).forEach((k) => {
            out.push({
                name: k[0].toUpperCase() + k.slice(1),
                speed:
                    typeof opts.speed[k] === "number"
                        ? opts.speed[k].toString()
                        : opts.speed["walk"].toString(),
            });
        });
    } else {
        out.push({
            name: "Walk",
            speed: opts.speed.toString(),
        });
    }
    return out;
};
