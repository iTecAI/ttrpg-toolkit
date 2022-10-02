(opts) => {
    if (opts.race) {
        return `${opts.name} ${opts.race}`;
    }
    return opts.name;
};
