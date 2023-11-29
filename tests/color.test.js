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
            a: "rgb(var(--color-a) / calc(var(--opacity-a, 1) * <alpha-value>))",
            "a-light": "#ffffff",
            "a-dark": "#000000",
            b: "rgb(var(--color-b) / calc(var(--opacity-b, 1) * <alpha-value>))",
            "b-light": "rgb(255, 255, 255)",
            "b-dark": "rgb(0, 0, 0)",
            c: "rgb(var(--color-c) / calc(var(--opacity-c, 1) * <alpha-value>))",
            "c-light": "#ffffff33",
            "c-dark": "#00000033",
            d: "rgb(var(--color-d) / calc(var(--opacity-d, 1) * <alpha-value>))",
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
                a: "rgb(var(--color-a) / calc(var(--opacity-a, 1) * <alpha-value>))",
                "a-light": "#ffffff",
                "a-dark": "#000000",
                b: "rgb(var(--color-b) / calc(var(--opacity-b, 1) * <alpha-value>))",
                "b-light": "rgb(255, 255, 255)",
                "b-dark": "rgb(0, 0, 0)",
                c: "rgb(var(--color-c) / calc(var(--opacity-c, 1) * <alpha-value>))",
                "c-light": "#ffffff33",
                "c-dark": "#00000033",
                d: "rgb(var(--color-d) / calc(var(--opacity-d, 1) * <alpha-value>))",
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
              --tw-bg-opacity: 1;
              background-color: rgb(var(--color-a) / calc(var(--opacity-a, 1) * var(--tw-bg-opacity)))
            }
            .bg-b {
              --tw-bg-opacity: 1;
              background-color: rgb(var(--color-b) / calc(var(--opacity-b, 1) * var(--tw-bg-opacity)))
            }
            .bg-c {
              --tw-bg-opacity: 1;
              background-color: rgb(var(--color-c) / calc(var(--opacity-c, 1) * var(--tw-bg-opacity)))
            }
            .bg-d {
              --tw-bg-opacity: 1;
              background-color: rgb(var(--color-d) / calc(var(--opacity-d, 1) * var(--tw-bg-opacity)))
            }
            .text-a\\/50 {
              color: rgb(var(--color-a) / calc(var(--opacity-a, 1) * 0.5))
            }
            .text-b\\/50 {
              color: rgb(var(--color-b) / calc(var(--opacity-b, 1) * 0.5))
            }
            .text-c\\/50 {
              color: rgb(var(--color-c) / calc(var(--opacity-c, 1) * 0.5))
            }
            .text-d\\/50 {
              color: rgb(var(--color-d) / calc(var(--opacity-d, 1) * 0.5))
            }
          `.replace(/\n|\s|\t/g, "")
        );

        let baseCSS = postcss([require("tailwindcss")(config)]).process(
          "@tailwind base"
        ).css;

        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `html {
          --color-a: 255 255 255;
          --color-b: 255 255 255;
          --color-c: 255 255 255;
          --opacity-c: 20%;
          --color-d: 255 255 255;
          --opacity-d: 20%;
        }`.replace(/\n|\s|\t/g, "")
        );
        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `${expectedSelector} {
          --color-a: 0 0 0;
          --color-b: 0 0 0;
          --color-c: 0 0 0;
          --opacity-c: 20%;
          --color-d: 0 0 0;
          --opacity-d: 20%;
        }`.replace(/\n|\s|\t/g, "")
        );
      });
    }
  );
});
