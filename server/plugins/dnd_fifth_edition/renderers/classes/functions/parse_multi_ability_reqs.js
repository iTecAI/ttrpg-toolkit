(opts) => {
    if (!opts.reqs || Object.keys(opts.reqs).length === 0) {
        return [];
    }

    return Object.keys(opts.reqs).map((k) => ({
        name: k[0].toUpperCase() + k.slice(1),
        value: opts.reqs[k],
    }));
};
