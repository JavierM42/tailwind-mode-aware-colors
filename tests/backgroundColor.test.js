const withModeAwareColors = require("../src/index");
const generateCss = require("./generateCss");

describe("backgroundColor theme", () => {
  const config = withModeAwareColors({
    theme: {
      backgroundColor: {
        a: {
          light: "#ffffff",
          dark: "#000000",
        },
      },
    },
  });

  it("Flattens color map and adds mode aware color", () => {
    expect(config).toEqual(
      expect.objectContaining({
        theme: {
          backgroundColor: {
            a: expect.any(Function),
            "a-light": "#ffffff",
            "a-dark": "#000000",
          },
        },
      })
    );
  });

  it("Defines mode aware color as a function based on opacity", () => {
    const a = config.theme.backgroundColor.a;
    expect(a({})).toEqual(
      "rgb(var(--color-background-a) / var(--opacity-background-a, 1))"
    );
    expect(a({ opacityValue: 0.4 })).toEqual(
      "rgb(var(--color-background-a) / 0.4)"
    );
    expect(a({ opacityValue: "var(--tw-bg-opacity)" })).toEqual(
      "rgb(var(--color-background-a) / var(--opacity-background-a, var(--tw-bg-opacity)))"
    );
  });

  describe("extend", () => {
    const config = withModeAwareColors({
      theme: {
        extend: {
          backgroundColor: {
            a: {
              light: "#ffffff",
              dark: "#000000",
            },
          },
        },
      },
    });

    it("Flattens extend color map and adds mode aware color", () => {
      expect(config).toEqual(
        expect.objectContaining({
          theme: {
            extend: {
              backgroundColor: {
                a: expect.any(Function),
                "a-light": "#ffffff",
                "a-dark": "#000000",
              },
            },
          },
        })
      );
    });

    it("Defines mode aware color as a function based on opacity", () => {
      const a = config.theme.extend.backgroundColor.a;
      expect(a({})).toEqual(
        "rgb(var(--color-background-a) / var(--opacity-background-a, 1))"
      );
      expect(a({ opacityValue: 0.4 })).toEqual(
        "rgb(var(--color-background-a) / 0.4)"
      );
      expect(a({ opacityValue: "var(--tw-bg-opacity)" })).toEqual(
        "rgb(var(--color-background-a) / var(--opacity-background-a, var(--tw-bg-opacity)))"
      );
    });
  });

  describe.each`
    darkModeConfig                      | expectedSelector
    ${undefined}                        | ${"@media (prefers-color-scheme: dark) { :root"}
    ${"media"}                          | ${"@media (prefers-color-scheme: dark) { :root"}
    ${["media", ".something"]}          | ${"@media (prefers-color-scheme: dark) { :root"}
    ${"selector"}                       | ${".dark"}
    ${["selector"]}                     | ${".dark"}
    ${["selector", ".custom-selector"]} | ${".custom-selector"}
  `(
    "When darkMode config is $darkModeConfig",
    ({ darkModeConfig, expectedSelector }) => {
      it("Generates the correct CSS", async () => {
        const config = withModeAwareColors({
          darkMode: darkModeConfig,
          content: [
            {
              raw: "bg-a/50 text-a border-a dark something custom-selector",
            },
          ],
          theme: {
            backgroundColor: {
              a: {
                light: "#ffffff",
                dark: "#000000",
              },
            },
          },
        });

        let utilitiesCSS = await generateCss("@tailwind utilities", config);

        expect(utilitiesCSS).toBe(
          `
          .bg-a\\/50 {
            background-color: rgb(var(--color-background-a) / 0.5)
          }
          `.replace(/\n|\s|\t/g, "")
        );

        let baseCSS = await generateCss("@tailwind base", config);

        expect(baseCSS).toContain(
          `:root {
          --color-background-a: 255 255 255;
        }`.replace(/\n|\s|\t/g, "")
        );
        expect(baseCSS).toContain(
          `${expectedSelector} {
          --color-background-a: 0 0 0;
        }`.replace(/\n|\s|\t/g, "")
        );
      });
    }
  );
});
