const withModeAwareColors = require("../src/index");
const postcss = require("postcss");

describe("Complex test", () => {
  it("Flattens color map and adds mode aware colors", () => {
    expect(
      withModeAwareColors({
        theme: {
          colors: {
            a: {
              light: "#fcfcfc",
              dark: "#030303",
            },
          },
          borderColor: {
            a: {
              light: "#ffffff",
              dark: "#000000",
            },
          },
          textColor: {
            a: {
              light: "#fefefe",
              dark: "#010101",
            },
          },
          backgroundColor: {
            a: {
              light: "#fdfdfd",
              dark: "#020202",
            },
          },
        },
      })
    ).toEqual(
      expect.objectContaining({
        theme: {
          colors: {
            a: "rgb(var(--color-a) / calc(var(--opacity-a, 1) * <alpha-value>))",
            "a-light": "#fcfcfc",
            "a-dark": "#030303",
          },
          borderColor: {
            a: "rgb(var(--color-border-a) / calc(var(--opacity-border-a, 1) * <alpha-value>))",
            "a-light": "#ffffff",
            "a-dark": "#000000",
          },
          textColor: {
            a: "rgb(var(--color-text-a) / calc(var(--opacity-text-a, 1) * <alpha-value>))",
            "a-light": "#fefefe",
            "a-dark": "#010101",
          },
          backgroundColor: {
            a: "rgb(var(--color-background-a) / calc(var(--opacity-background-a, 1) * <alpha-value>))",
            "a-light": "#fdfdfd",
            "a-dark": "#020202",
          },
        },
      })
    );
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
              raw: "bg-a text-a/50 border-a outline-a/20 dark something custom-selector",
            },
          ],
          theme: {
            colors: {
              a: {
                light: "#fcfcfc",
                dark: "#030303",
              },
            },
            borderColor: {
              a: {
                light: "#ffffff",
                dark: "#000000",
              },
            },
            textColor: {
              a: {
                light: "#fefefe",
                dark: "#010101",
              },
            },
            backgroundColor: {
              a: {
                light: "#fdfdfd",
                dark: "#020202",
              },
            },
          },
        });

        let utilitiesCSS = postcss([require("tailwindcss")(config)]).process(
          "@tailwind utilities"
        ).css;

        expect(utilitiesCSS.replace(/\n|\s|\t/g, "")).toBe(
          `
      .border-a {
        --tw-border-opacity: 1;
        border-color: rgb(var(--color-border-a) / calc(var(--opacity-border-a, 1) * var(--tw-border-opacity)))
      }
      .bg-a {
        --tw-bg-opacity: 1;
        background-color: rgb(var(--color-background-a) / calc(var(--opacity-background-a, 1) * var(--tw-bg-opacity)))
      }
      .text-a\\/50 {
        color: rgb(var(--color-text-a) / calc(var(--opacity-text-a, 1) * 0.5))
      }
      .outline-a\\/20 {
        outline-color: rgb(var(--color-a) / calc(var(--opacity-a, 1) * 0.2))
      }
      `.replace(/\n|\s|\t/g, "")
        );

        let baseCSS = postcss([require("tailwindcss")(config)]).process(
          "@tailwind base"
        ).css;

        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `html {
          --color-a: 252 252 252;
          --color-text-a: 254 254 254;
          --color-background-a: 253 253 253;
          --color-border-a: 255 255 255;
        }`.replace(/\n|\s|\t/g, "")
        );
        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `${expectedSelector} {
          --color-a: 3 3 3;
          --color-text-a: 1 1 1;
          --color-background-a: 2 2 2;
          --color-border-a: 0 0 0;
        }`.replace(/\n|\s|\t/g, "")
        );
      });
    }
  );
});
