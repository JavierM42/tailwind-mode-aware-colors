const withModeAwareColors = require("../src/index");
const postcss = require("postcss", { async: true });

describe("color theme", () => {
  it("Flattens color map and adds mode aware color", () => {
    expect(
      withModeAwareColors({
        theme: {
          colors: {
            a: {
              light: "#ffffff",
              dark: "#000000",
            },
            b: {
              light: 'rgb(255, 255, 255)',
              dark: 'rgb(0, 0, 0)',
            },
            c: {
              light: '#ffffff33',
              dark: '#00000033',
            },
            d: {
              light: 'rgba(255, 255, 255, 0.2)',
              dark: 'rgba(0, 0, 0, 0.2)',
            },
          },
        },
      })
    ).toEqual(
      expect.objectContaining({
        theme: {
          colors: {
            a: "rgba(var(--color-a))",
            "a-light": "#ffffff",
            "a-dark": "#000000",
            b: "rgba(var(--color-b))",
            "b-light": "rgb(255, 255, 255)",
            "b-dark": "rgb(0, 0, 0)",
            c: "rgba(var(--color-c))",
            "c-light": "#ffffff33",
            "c-dark": "#00000033",
            d: "rgba(var(--color-d))",
            "d-light": "rgba(255, 255, 255, 0.2)",
            "d-dark": "rgba(0, 0, 0, 0.2)",
          },
        },
      })
    );
  });

  describe("extend", () => {
    it("Flattens extend color map and adds mode aware color", () => {
      expect(
        withModeAwareColors({
          theme: {
            extend: {
              colors: {
                a: {
                  light: "#ffffff",
                  dark: "#000000",
                },
                b: {
                  light: 'rgb(255, 255, 255)',
                  dark: 'rgb(0, 0, 0)',
                },
                c: {
                  light: '#ffffff33',
                  dark: '#00000033',
                },
                d: {
                  light: 'rgba(255, 255, 255, 0.2)',
                  dark: 'rgba(0, 0, 0, 0.2)',
                },
              },
            },
          },
        })
      ).toEqual(
        expect.objectContaining({
          theme: {
            extend: {
              colors: {
                a: "rgba(var(--color-a))",
                "a-light": "#ffffff",
                "a-dark": "#000000",
                b: "rgba(var(--color-b))",
                "b-light": "rgb(255, 255, 255)",
                "b-dark": "rgb(0, 0, 0)",
                c: "rgba(var(--color-c))",
                "c-light": "#ffffff33",
                "c-dark": "#00000033",
                d: "rgba(var(--color-d))",
                "d-light": "rgba(255, 255, 255, 0.2)",
                "d-dark": "rgba(0, 0, 0, 0.2)",
              },
            },
          },
        })
      );
    });
  });

  describe.each`
    darkModeConfig                   | expectedSelector
    ${undefined}                     | ${"@media (prefers-color-scheme: dark) { html"}
    ${"media"}                       | ${"@media (prefers-color-scheme: dark) { html"}
    ${["media", ".something"]}       | ${"@media (prefers-color-scheme: dark) { html"}
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
              raw: "bg-a text-a/50 dark something custom-selector bg-b text-b/50 bg-c text-c/50 bg-d text-d/50",
            },
          ],
          theme: {
            colors: {
              a: {
                light: "#ffffff",
                dark: "#000000",
              },
              b: {
                light: 'rgb(255, 255, 255)',
                dark: 'rgb(0, 0, 0)',
              },
              c: {
                light: '#ffffff33',
                dark: '#00000033',
              },
              d: {
                light: 'rgba(255, 255, 255, 0.2)',
                dark: 'rgba(0, 0, 0, 0.2)',
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
              background-color: rgba(var(--color-a))
            }
            .bg-b {
              background-color: rgba(var(--color-b))
            }
            .bg-c {
              background-color: rgba(var(--color-c))
            }
            .bg-d {
              background-color: rgba(var(--color-d))
            }
            .text-a\\/50 {
              color: rgba(var(--color-a), 0.5)
            }
            .text-b\\/50 {
              color: rgba(var(--color-b), 0.5)
            }
            .text-c\\/50 {
              color: rgba(var(--color-c), 0.5)
            }
            .text-d\\/50 {
              color: rgba(var(--color-d), 0.5)
            }
          `.replace(/\n|\s|\t/g, "")
        );

        let baseCSS = postcss([require("tailwindcss")(config)]).process(
          "@tailwind base"
        ).css;

        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `html {
          --color-a: 255, 255, 255;
          --color-b: 255, 255, 255;
          --color-c: 255, 255, 255, 0.2;
          --color-d: 255, 255, 255, 0.2;
        }`.replace(/\n|\s|\t/g, "")
        );
        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `${expectedSelector} {
          --color-a: 0, 0, 0;
          --color-b: 0, 0, 0;
          --color-c: 0, 0, 0, 0.2;
          --color-d: 0, 0, 0, 0.2;
        }`.replace(/\n|\s|\t/g, "")
        );
      });
    }
  );
});
