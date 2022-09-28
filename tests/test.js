const withModeAwareColors = require("../src/index");
const postcss = require("postcss");

describe("When config is well-formed", () => {
  it("Flattens color map and adds mode aware color when there are both light and dark segments", () => {
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
            a: "rgb(var(--color-a) / <alpha-value>)",
            "a-light": "#ffffff",
            "a-dark": "#000000",
          },
        },
      })
    );
  });

  it("Flattens color map and adds mode aware color when there are both light and dark segment, even if nested", () => {
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

  it("Flattens color map and adds mode aware color when there are both light and dark segments, even if they're not at the end", () => {
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

  it("Flattens color map and adds mode aware color when there are both light and dark segments, even if they're at the start", () => {
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

  describe.each`
    darkModeConfig                   | expectedSelector
    ${undefined}                     | ${"@media (prefers-color-scheme: dark)"}
    ${"media"}                       | ${"@media (prefers-color-scheme: dark)"}
    ${["media", ".something"]}       | ${"@media (prefers-color-scheme: dark)"}
    ${"class"}                       | ${".dark"}
    ${["class"]}                     | ${".dark"}
    ${["class", ".custom-selector"]} | ${".custom-selector"}
  `(
    "When darkMode config is $darkModeConfig",
    ({ darkModeConfig, expectedSelector }) => {
      it("Generates the correct CSS", () => {
        const config = withModeAwareColors({
          darkMode: darkModeConfig,
          content: [
            {
              raw: "bg-a text-a/50 dark something custom-selector",
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
          `${expectedSelector} {
          --color-a: 0 0 0;
        }`.replace(/\n|\s|\t/g, "")
        );
      });
    }
  );
});

describe("When mode-aware color key is already defined", () => {
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
