(options) => {
    const { spellcasting } = options;
    const LKEYS = ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9"];
    const LNAMES = [
        "1st",
        "2nd",
        "3rd",
        "4th",
        "5th",
        "6th",
        "7th",
        "8th",
        "9th",
        "10th",
        "11th",
        "12th",
        "13th",
        "14th",
        "15th",
        "16th",
        "17th",
        "18th",
        "19th",
        "20th",
    ];
    if (spellcasting.spell_progression) {
        let rows = [];
        let row;
        for (
            let level = 0;
            level < spellcasting.spell_progression.length;
            level++
        ) {
            row = { name: LNAMES[level] };
            row.L0 = (
                spellcasting.cantrip_progression[level] || "-"
            ).toString();
            for (let sl = 0; sl < LKEYS.length; sl++) {
                row[LKEYS[sl]] = (
                    spellcasting.spell_progression[level][sl] || "-"
                ).toString();
            }
            rows.push(row);
        }
        return rows;
    } else {
        return [];
    }
};
