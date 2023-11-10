const withModeAwareColors = require("../src/index");
const postcss = require("postcss");

describe("outlineColor theme", () => {
  it("Flattens color map and adds mode aware color", () => {
    expect(
      withModeAwareColors({
        theme: {
          outlineColor: {
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
          outlineColor: {
            a: "rgb(var(--color-outline-a) / <alpha-value>)",
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
              outlineColor: {
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
              outlineColor: {
                a: "rgb(var(--color-outline-a) / <alpha-value>)",
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
              raw: "bg-a/50 text-a border-a outline-a/50 dark something custom-selector",
            },
          ],
          theme: {
            outlineColor: {
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
          .outline-a\\/50 {
            outline-color: rgb(var(--color-outline-a) / 0.5)
          }
          `.replace(/\n|\s|\t/g, "")
        );

        let baseCSS = postcss([require("tailwindcss")(config)]).process(
          "@tailwind base"
        ).css;

        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `html {
          --color-outline-a: 255 255 255;
        }`.replace(/\n|\s|\t/g, "")
        );
        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `${expectedSelector} {
          --color-outline-a: 0 0 0;
        }`.replace(/\n|\s|\t/g, "")
        );
      });
    }
  );
});
