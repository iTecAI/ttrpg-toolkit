(opts) => {
    const cls = [
        "artificer",
        "barbarian",
        "bard",
        "cleric",
        "druid",
        "fighter",
        "monk",
        "paladin",
        "ranger",
        "rogue",
        "sorcerer",
        "warlock",
        "wizard",
    ];
    for (var c of cls) {
        if (opts.name.toLowerCase().includes(c)) {
            return "/api/plugins/dnd_fifth_edition/assets/" + c;
        }
    }
    return "/api/plugins/dnd_fifth_edition/assets/fighter";
};
