const withModeAwareColors = require("../src/index");

describe("With nested color syntax", () => {
  const config = withModeAwareColors({
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
  });

  it("Flattens color map and adds mode aware color", () => {
    expect(config).toEqual(
      expect.objectContaining({
        theme: {
          colors: {
            "a-b": expect.any(Function),
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
            "a-b-c": expect.any(Function),
            "a-b-light-c": "#ffffff",
            "a-b-dark-c": "#000000",
          },
        },
      })
    );
  });
});

describe("With light- and dark- segments at the start", () => {
  it.skip("Flattens color map and adds mode aware color", () => {
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
            a: expect.any(Function),
            "light-a": "#ffffff",
            "dark-a": "#000000",
          },
        },
      })
    );
  });
});

describe("With custom light and dark ids", () => {
  it.skip("Flattens color map and adds mode aware color", () => {
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
            a: expect.any(Function),
            "a-claro": "#ffffff",
            "a-oscuro": "#000000",
          },
        },
      })
    );
  });
});
