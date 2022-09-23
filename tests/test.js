const withModeAwareColors = require("../src/index");
const postcss = require("postcss");

describe("When config is well-formed", () => {
  it("Adds DEFAULT key to colors that have light and dark keys", () => {
    expect(
      withModeAwareColors({
        theme: {
          colors: {
            a: {
              light: "#ffffff",
              dark: "#000000",
            },
          },
        },
      })
    ).toEqual(
      expect.objectContaining({
        theme: {
          colors: {
            a: {
              DEFAULT: "rgb(var(--color-a) / <alpha-value>)",
              light: "#ffffff",
              dark: "#000000",
            },
          },
        },
      })
    );
  });

  it("Adds DEFAULT key to nested colors that have light and dark keys", () => {
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
            a: {
              b: {
                DEFAULT: "rgb(var(--color-a-b) / <alpha-value>)",
                light: "#ffffff",
                dark: "#000000",
              },
            },
          },
        },
      })
    );
  });

  it("Generates the correct CSS", () => {
    const config = withModeAwareColors({
      content: [
        {
          raw: "bg-a text-a/50 dark",
        },
      ],
      theme: {
        colors: {
          a: {
            light: "#ffffff",
            dark: "#000000",
          },
        },
      },
    });

    let utilitiesCSS = postcss([require("tailwindcss")(config)]).process(
      "@tailwind utilities"
    ).css;

    expect(utilitiesCSS.replace(/\n|\s|\t/g, "")).toBe(
      `
    .bg-a {
      --tw-bg-opacity: 1;
      background-color: rgb(var(--color-a) / var(--tw-bg-opacity))
    }
      .text-a\\/50 {
      color: rgb(var(--color-a) / 0.5)
    }
    `.replace(/\n|\s|\t/g, "")
    );

    let baseCSS = postcss([require("tailwindcss")(config)]).process(
      "@tailwind base"
    ).css;

    expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
      `html {
        --color-a: 255 255 255;
      }`.replace(/\n|\s|\t/g, "")
    );
    expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
      `.dark {
        --color-a: 0 0 0;
      }`.replace(/\n|\s|\t/g, "")
    );
  });
});

describe("When config is not well-formed", () => {
  describe("Because light value is not a string", () => {
    it("Throws", () => {
      expect(() =>
        withModeAwareColors({
          theme: {
            colors: {
              a: {
                light: { b: "#ffffff" },
                dark: "#000000",
              },
            },
          },
        })
      ).toThrow();
    });
  });

  describe("Because dark value is not a string", () => {
    it("Throws", () => {
      expect(() =>
        withModeAwareColors({
          theme: {
            colors: {
              a: {
                light: "#ffffff",
                dark: 4,
              },
            },
          },
        })
      ).toThrow();
    });
  });

  describe("Because DEFAULT value is already defined", () => {
    it("Throws", () => {
      expect(() =>
        withModeAwareColors({
          theme: {
            colors: {
              a: {
                DEFAULT: "#aaaaaa",
                light: "#ffffff",
                dark: "#000000",
              },
            },
          },
        })
      ).toThrow();
    });
  });
});
