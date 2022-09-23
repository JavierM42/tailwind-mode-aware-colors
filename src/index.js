const plugin = require("tailwindcss/plugin");
const chroma = require("chroma-js");

module.exports = (config) => {
  const colors = config.theme.colors || {};

  const stylesToAdd = { html: {}, ".dark": {} };

  const traverseColorsMap = (path, colorsMap) => {
    if (colorsMap.light && colorsMap.dark) {
      if (
        typeof colorsMap.light === "string" &&
        typeof colorsMap.dark === "string"
      ) {
        const varName = `--color-${path.join("-")}`;

        if (colorsMap["DEFAULT"] === undefined) {
          colorsMap["DEFAULT"] = `rgb(var(${varName}) / <alpha-value>)`;

          stylesToAdd["html"][varName] = chroma(colorsMap.light)
            .rgb()
            .join(" ");
          stylesToAdd[".dark"][varName] = chroma(colorsMap.dark)
            .rgb()
            .join(" ");
        } else {
          throw "withModeAwareColors plugin error: adding a mode-aware color would overwrite a DEFAULT color. If 'light' and 'dark' values are specified for a color, DEFAULT must not be included.";
        }
      } else {
        throw "withModeAwareColors plugin error: 'light' and 'dark' color keys must have string values.";
      }
    }

    // recursively traverse the rest of the keys in search of 'light' and 'dark' keys
    Object.keys(colorsMap).forEach((key) => {
      if (
        !["DEFAULT", "light", "dark"].includes(key) &&
        colorsMap[key] &&
        typeof colorsMap[key] === "object" &&
        !Array.isArray(colorsMap[key])
      ) {
        traverseColorsMap([...path, key], colorsMap[key]);
      }
    });
  };

  traverseColorsMap([], colors);

  return {
    ...config,
    theme: { ...(config.theme || []), colors },
    plugins: [
      ...(config.plugins || []),
      plugin(({ addBase }) => addBase(stylesToAdd)),
    ],
  };
};
