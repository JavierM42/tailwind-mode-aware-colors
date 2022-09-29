const plugin = require("tailwindcss/plugin");
const Color = require("color");

// from tailwindcss src/util/flattenColorPalette
const flattenColorPalette = (colors) =>
  Object.assign(
    {},
    ...Object.entries(colors ?? {}).flatMap(([color, values]) =>
      typeof values == "object"
        ? Object.entries(flattenColorPalette(values)).map(([number, hex]) => ({
            [color + (number === "DEFAULT" ? "" : `-${number}`)]: hex,
          }))
        : [{ [`${color}`]: values }]
    )
  );

module.exports = (config) => {
  const extendsDefaultColors = !config.theme.colors;

  const colors = flattenColorPalette(
    extendsDefaultColors
      ? config.theme.extend.colors || {}
      : config.theme.colors
  );

  const LIGHT_SELECTOR = "html";
  const DARK_SELECTOR = Array.isArray(config.darkMode)
    ? config.darkMode[0] === "class"
      ? config.darkMode[1] || ".dark"
      : "@media (prefers-color-scheme: dark)"
    : config.darkMode === "class"
    ? ".dark"
    : "@media (prefers-color-scheme: dark)";

  const stylesToAdd = { html: {}, [DARK_SELECTOR]: {} };

  Object.keys(colors).forEach((colorName) => {
    const match = colorName.match(new RegExp(/^(?:(.+)-)?light(?:-(.+))?$/));

    if (match) {
      const prefix = match[1];
      const suffix = match[2];
      const modeAwareColorName = [prefix, suffix].filter((x) => x).join("-");

      const lightColor = colors[colorName];
      const darkColor =
        colors[[prefix, "dark", suffix].filter((x) => x).join("-")];

      if (lightColor && darkColor) {
        if (colors[modeAwareColorName]) {
          throw `withModeAwareColors plugin error: adding the '${modeAwareColorName}' mode-aware color would overwrite an existing color.`;
        } else {
          const varName = `--color-${modeAwareColorName}`;
          colors[modeAwareColorName] = `rgb(var(${varName}) / <alpha-value>)`;

          stylesToAdd[LIGHT_SELECTOR][varName] = Color(lightColor)
            .rgb()
            .array()
            .join(" ");
          stylesToAdd[DARK_SELECTOR][varName] = Color(darkColor)
            .rgb()
            .array()
            .join(" ");
        }
      }
    }
  });

  return {
    ...config,
    theme: extendsDefaultColors
      ? { ...config.theme, extend: { ...(config.theme.extend || {}), colors } }
      : { ...(config.theme || []), colors },
    plugins: [
      ...(config.plugins || []),
      plugin(({ addBase }) => addBase(stylesToAdd)),
    ],
  };
};
