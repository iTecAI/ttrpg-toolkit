(opts) => {
    if (!opts.skills) {
        return [];
    }
    const out = [];
    const arr = new Array(...opts.skills);

    const capitalize = (string) =>
        String(string)
            .split(" ")
            .map((v) => v[0].toUpperCase() + v.slice(1))
            .join(" ");

    for (var sk of arr) {
        var current = {};
        if (sk.mode === "choose") {
            current.sub = `Choose ${sk.count} of the following:`;
            current.choices = sk.choose_from.map(capitalize);
        } else if (sk.mode === "any") {
            current.sub = `Choose ${sk.count} of the following (any):`;
            current.choices = [
                "athletics",
                "acrobatics",
                "sleight of hand",
                "stealth",
                "arcana",
                "history",
                "investigation",
                "nature",
                "religion",
                "animal handling",
                "insight",
                "medicine",
                "perception",
                "survival",
                "deception",
                "intimidation",
                "performance",
                "persuasion",
            ].map(capitalize);
        }
        out.push(current);
    }
    return out;
};
