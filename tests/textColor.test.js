const withModeAwareColors = require("../src/index");
const postcss = require("postcss");

describe("textColor theme", () => {
  it("Flattens color map and adds mode aware color", () => {
    expect(
      withModeAwareColors({
        theme: {
          textColor: {
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
          textColor: {
            a: "rgb(var(--color-text-a) / <alpha-value>)",
            "a-light": "#ffffff",
            "a-dark": "#000000",
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
              textColor: {
                a: {
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
            extend: {
              textColor: {
                a: "rgb(var(--color-text-a) / <alpha-value>)",
                "a-light": "#ffffff",
                "a-dark": "#000000",
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
              raw: "bg-a text-a/50 dark something custom-selector",
            },
          ],
          theme: {
            textColor: {
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
          .text-a\\/50 {
            color: rgb(var(--color-text-a) / 0.5)
          }
          `.replace(/\n|\s|\t/g, "")
        );

        let baseCSS = postcss([require("tailwindcss")(config)]).process(
          "@tailwind base"
        ).css;

        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `html {
          --color-text-a: 255 255 255;
        }`.replace(/\n|\s|\t/g, "")
        );
        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `${expectedSelector} {
          --color-text-a: 0 0 0;
        }`.replace(/\n|\s|\t/g, "")
        );
      });
    }
  );
});
