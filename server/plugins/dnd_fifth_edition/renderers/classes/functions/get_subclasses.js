(opts) => {
    var raw = opts.subs.map((v) => ({
        name: v.name,
    }));
    if (raw.length > 11) {
        var proc = raw.slice(0, 10);
        proc.push({ name: raw.length - proc.length + " More" });
        return proc;
    }
    return raw;
};
