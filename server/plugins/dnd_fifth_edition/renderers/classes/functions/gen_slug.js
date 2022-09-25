(opts) => {
    var name = String(opts.name).toLowerCase();
    var src = String(opts.src).toLowerCase();
    var allowed = "qwertyuiopasdfghjklzxcvbnm0123456789";
    return (name + "-" + src)
        .split("")
        .map((l) => (allowed.includes(l) ? l : "-"))
        .join("");
};
