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

const processColors = (
  palette,
  styles,
  { usesMediaStrategy, darkSelector, lightId, darkId, variablePrefix = "" }
) => {
  if (!palette) return { colors: {}, styles };

  const colors = flattenColorPalette(palette);

  Object.keys(colors).forEach((colorName) => {
    const match = colorName.match(
      new RegExp(`^(?:(.+)-)?${lightId}(?:-(.+))?$`)
    );

    if (match) {
      const prefix = match[1];
      const suffix = match[2];
      const modeAwareColorName = [prefix, suffix].filter((x) => x).join("-");

      const lightColor = colors[colorName];
      const darkColor =
        colors[[prefix, darkId, suffix].filter((x) => x).join("-")];

      if (lightColor && darkColor) {
        if (colors[modeAwareColorName]) {
          throw `withModeAwareColors plugin error: adding the '${modeAwareColorName}' mode-aware color would overwrite an existing color.`;
        } else {
          const lightArray = Color(lightColor).rgb().array();
          const lightColorStyle = lightArray.slice(0, 3).join(" ");
          const lightOpacityStyle =
            lightArray.length > 3 ? `${lightArray[3] * 100}%` : undefined;

          const darkArray = Color(darkColor).rgb().array();
          const darkColorStyle = darkArray.slice(0, 3).join(" ");
          const darkOpacityStyle =
            darkArray.length > 3 ? `${darkArray[3] * 100}%` : undefined;

          const colorVariable = `--color-${
            variablePrefix ? `${variablePrefix}-` : ""
          }${modeAwareColorName}`;

          const opacityVariable = `--opacity-${
            variablePrefix ? `${variablePrefix}-` : ""
          }${modeAwareColorName}`;

          colors[modeAwareColorName] = ({ opacityValue }) =>
            `rgb(var(${colorVariable}) / ${
              opacityValue
                ? typeof opacityValue === "string" &&
                  opacityValue.startsWith("var(")
                  ? `var(${opacityVariable}, ${opacityValue})`
                  : opacityValue
                : `var(${opacityVariable}, 1)`
            })`;

          styles[":root"][colorVariable] = lightColorStyle;
          if (lightOpacityStyle) {
            styles[":root"][opacityVariable] = lightOpacityStyle;
          }

          if (usesMediaStrategy) {
            styles["@media (prefers-color-scheme: dark)"][":root"][
              colorVariable
            ] = darkColorStyle;
            if (darkOpacityStyle) {
              styles["@media (prefers-color-scheme: dark)"][":root"][
                opacityVariable
              ] = darkOpacityStyle;
            }
          } else {
            styles[darkSelector][colorVariable] = darkColorStyle;
            if (darkOpacityStyle) {
              styles[darkSelector][opacityVariable] = darkOpacityStyle;
            }
          }
        }
      }
    }
  });

  return { colors, styles };
};

module.exports = (
  config,
  { lightId, darkId } = { lightId: "light", darkId: "dark" }
) => {
  const usesMediaStrategy = Array.isArray(config.darkMode)
    ? config.darkMode[0] !== "selector"
    : config.darkMode !== "selector";
  const darkSelector =
    !usesMediaStrategy &&
    (Array.isArray(config.darkMode) ? config.darkMode[1] || ".dark" : ".dark");

  const styles = {
    ":root": {},
    ...(usesMediaStrategy
      ? { "@media (prefers-color-scheme: dark)": { ":root": {} } }
      : { [darkSelector]: {} }),
  };

  // color
  if (config.theme?.colors) {
    const { colors } = processColors(config.theme.colors, styles, {
      usesMediaStrategy,
      darkSelector,
      lightId,
      darkId,
    });
    config.theme.colors = colors;
  }
  if (config.theme?.extend?.colors) {
    const { colors } = processColors(config.theme.extend.colors, styles, {
      usesMediaStrategy,
      darkSelector,
      lightId,
      darkId,
    });
    config.theme.extend.colors = colors;
  }

  // textColor
  if (config.theme?.textColor) {
    const { colors } = processColors(config.theme.textColor, styles, {
      usesMediaStrategy,
      darkSelector,
      lightId,
      darkId,
      variablePrefix: "text",
    });
    config.theme.textColor = colors;
  }
  if (config.theme?.extend?.textColor) {
    const { colors } = processColors(config.theme.extend.textColor, styles, {
      usesMediaStrategy,
      darkSelector,
      lightId,
      darkId,
      variablePrefix: "text",
    });
    config.theme.extend.textColor = colors;
  }

  // backgroundColor
  if (config.theme?.backgroundColor) {
    const { colors } = processColors(config.theme.backgroundColor, styles, {
      usesMediaStrategy,
      darkSelector,
      lightId,
      darkId,
      variablePrefix: "background",
    });
    config.theme.backgroundColor = colors;
  }
  if (config.theme?.extend?.backgroundColor) {
    const { colors } = processColors(
      config.theme.extend.backgroundColor,
      styles,
      {
        usesMediaStrategy,
        darkSelector,
        lightId,
        darkId,
        variablePrefix: "background",
      }
    );
    config.theme.extend.backgroundColor = colors;
  }

  // borderColor
  if (config.theme?.borderColor) {
    const { colors } = processColors(config.theme.borderColor, styles, {
      usesMediaStrategy,
      darkSelector,
      lightId,
      darkId,
      variablePrefix: "border",
    });
    config.theme.borderColor = colors;
  }
  if (config.theme?.extend?.borderColor) {
    const { colors } = processColors(config.theme.extend.borderColor, styles, {
      usesMediaStrategy,
      darkSelector,
      lightId,
      darkId,
      variablePrefix: "border",
    });
    config.theme.extend.borderColor = colors;
  }

  // outlineColor
  if (config.theme?.outlineColor) {
    const { colors } = processColors(config.theme.outlineColor, styles, {
      usesMediaStrategy,
      darkSelector,
      lightId,
      darkId,
      variablePrefix: "outline",
    });
    config.theme.outlineColor = colors;
  }
  if (config.theme?.extend?.outlineColor) {
    const { colors } = processColors(config.theme.extend.outlineColor, styles, {
      usesMediaStrategy,
      darkSelector,
      lightId,
      darkId,
      variablePrefix: "outline",
    });
    config.theme.extend.outlineColor = colors;
  }

  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      plugin(({ addBase }) => addBase(styles)),
    ],
  };
};
