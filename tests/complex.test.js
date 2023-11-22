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
            a: "rgba(var(--color-a))",
            "a-light": "#fcfcfc",
            "a-dark": "#030303",
          },
          borderColor: {
            a: "rgba(var(--color-border-a))",
            "a-light": "#ffffff",
            "a-dark": "#000000",
          },
          textColor: {
            a: "rgba(var(--color-text-a))",
            "a-light": "#fefefe",
            "a-dark": "#010101",
          },
          backgroundColor: {
            a: "rgba(var(--color-background-a))",
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
        border-color: rgba(var(--color-border-a))
      }
      .bg-a {
        background-color: rgba(var(--color-background-a))
      }
      .text-a\\/50 {
        color: rgba(var(--color-text-a), 0.5)
      }
      .outline-a\\/20 {
        outline-color: rgba(var(--color-a), 0.2)
      }
      `.replace(/\n|\s|\t/g, "")
        );

        let baseCSS = postcss([require("tailwindcss")(config)]).process(
          "@tailwind base"
        ).css;

        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `html {
          --color-a: 252, 252, 252;
          --color-text-a: 254, 254, 254;
          --color-background-a: 253, 253, 253;
          --color-border-a: 255, 255, 255;
        }`.replace(/\n|\s|\t/g, "")
        );
        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `${expectedSelector} {
          --color-a: 3, 3, 3;
          --color-text-a: 1, 1, 1;
          --color-background-a: 2, 2, 2;
          --color-border-a: 0, 0, 0;
        }`.replace(/\n|\s|\t/g, "")
        );
      });
    }
  );
});
