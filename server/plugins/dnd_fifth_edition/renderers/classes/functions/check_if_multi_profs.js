(opts) => {
    for (var p of ["armor", "skill", "weapon", "tool"]) {
        if (opts[p]) {
            if (opts[p].length > 0) {
                return true;
            }
        }
    }
    if (Object.keys(opts.requirements).length > 0) {
        return true;
    }
    return false;
};
