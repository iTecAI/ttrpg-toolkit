(source) => {
    return source.or
        ? Object.keys(source.or[0]).map((i) => {
              return {
                  ability: i[0].toUpperCase() + i.slice(1),
                  requiredScore: source.or[0][i],
              };
          })
        : Object.keys(source).map((k) => {
              return {
                  ability: k[0].toUpperCase() + k.slice(1),
                  requiredScore: source[k],
              };
          });
};
