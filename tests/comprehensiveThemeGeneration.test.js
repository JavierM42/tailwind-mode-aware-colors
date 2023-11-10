const withModeAwareColors = require("../src/index");

describe("With nested color syntax", () => {
  it("Flattens color map and adds mode aware color", () => {
    expect(
      withModeAwareColors({
        theme: {
          colors: {
            a: {
              b: {
                light: "#ffffff",
                dark: "#000000",
              },
            },
          },
        },
      })
    ).toEqual(
      expect.objectContaining({
        theme: {
          colors: {
            "a-b": "rgb(var(--color-a-b) / <alpha-value>)",
            "a-b-light": "#ffffff",
            "a-b-dark": "#000000",
          },
        },
      })
    );
  });
});

describe("With -light- and -dark- segments in the middle", () => {
  it("Flattens color map and adds mode aware color", () => {
    expect(
      withModeAwareColors({
        theme: {
          colors: {
            a: {
              b: {
                light: {
                  c: "#ffffff",
                },
                dark: {
                  c: "#000000",
                },
              },
            },
          },
        },
      })
    ).toEqual(
      expect.objectContaining({
        theme: {
          colors: {
            "a-b-c": "rgb(var(--color-a-b-c) / <alpha-value>)",
            "a-b-light-c": "#ffffff",
            "a-b-dark-c": "#000000",
          },
        },
      })
    );
  });
});

describe("With light- and dark- segments at the start", () => {
  it("Flattens color map and adds mode aware color", () => {
    expect(
      withModeAwareColors({
        theme: {
          colors: {
            light: {
              a: "#ffffff",
            },
            dark: {
              a: "#000000",
            },
          },
        },
      })
    ).toEqual(
      expect.objectContaining({
        theme: {
          colors: {
            a: "rgb(var(--color-a) / <alpha-value>)",
            "light-a": "#ffffff",
            "dark-a": "#000000",
          },
        },
      })
    );
  });
});

describe("With custom light and dark ids", () => {
  it("Flattens color map and adds mode aware color", () => {
    expect(
      withModeAwareColors(
        {
          theme: {
            colors: {
              a: {
                claro: "#ffffff",
                oscuro: "#000000",
              },
            },
          },
        },
        { lightId: "claro", darkId: "oscuro" }
      )
    ).toEqual(
      expect.objectContaining({
        theme: {
          colors: {
            a: "rgb(var(--color-a) / <alpha-value>)",
            "a-claro": "#ffffff",
            "a-oscuro": "#000000",
          },
        },
      })
    );
  });
});
