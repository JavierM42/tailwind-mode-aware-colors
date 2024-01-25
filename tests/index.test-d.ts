import {expectAssignable, expectError} from 'tsd';
import colors from "tailwindcss/colors";
import withModeAwareColors from "../src/index";

type Options = NonNullable<Parameters<typeof withModeAwareColors>[1]>;

withModeAwareColors({
  content: ["./index.html"],
  theme: {
    container: {
      center: true,
    },
    colors: {
      a: colors.white,
      b: {
        light: "#fcfcfc",
        dark: "#030303",
      },
      c: {
        DEFAULT: "#ffffff33",
        muted: {
          light: "#fefefe33",
          dark: "#00000033",
        },
      },
    },
    extend: {
      width: {
        prose: "65ch",
      },
    },
  },
  plugins: [],
});

withModeAwareColors({
  content: ["./index.html"],
  theme: {
    colors: {
      a: {
        light: "#fcfcfc",
        dark: "#030303",
      },
    },
  },
}, {
  lightId: "claro",
  darkId: "oscuro",
});

// Invalid form: see discussion is #8
withModeAwareColors({
  content: ["./index.html"],
  theme: {
    colors: ({ colors }) => ({
      a: colors.white,
    }),
  },
});

expectAssignable<Options>({
  lightId: "claro",
  darkId: "oscuro",
});

expectAssignable<Options>({
  lightId: "claro",
});

expectAssignable<Options>({
  darkId: "oscuro",
});

expectAssignable<Options>({});

expectError<Options>({
  extra: "extra",
});
