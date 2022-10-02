(opts) => {
    return (
        {
            T: "Tiny",
            S: "Small",
            M: "Medium",
            L: "Large",
            H: "Huge",
            G: "Gargantuan",
        }[opts.size] ?? "Medium"
    );
};
