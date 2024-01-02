const withModeAwareColors = require("../src/index");
const postcss = require("postcss");

describe("borderColor theme", () => {
  const config = withModeAwareColors({
    theme: {
      borderColor: {
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
          borderColor: {
            a: expect.any(Function),
            "a-light": "#ffffff",
            "a-dark": "#000000",
          },
        },
      })
    );
  });

  it("Defines mode aware color as a function based on opacity", () => {
    const a = config.theme.borderColor.a;
    expect(a({})).toEqual(
      "rgb(var(--color-border-a) / var(--opacity-border-a, 1))"
    );
    expect(a({ opacityValue: 0.4 })).toEqual(
      "rgb(var(--color-border-a) / 0.4)"
    );
    expect(a({ opacityValue: "var(--tw-border-opacity)" })).toEqual(
      "rgb(var(--color-border-a) / var(--opacity-border-a, var(--tw-border-opacity)))"
    );
  });

  describe("extend", () => {
    const config = withModeAwareColors({
      theme: {
        extend: {
          borderColor: {
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
              borderColor: {
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
      const a = config.theme.extend.borderColor.a;
      expect(a({})).toEqual(
        "rgb(var(--color-border-a) / var(--opacity-border-a, 1))"
      );
      expect(a({ opacityValue: 0.4 })).toEqual(
        "rgb(var(--color-border-a) / 0.4)"
      );
      expect(a({ opacityValue: "var(--tw-border-opacity)" })).toEqual(
        "rgb(var(--color-border-a) / var(--opacity-border-a, var(--tw-border-opacity)))"
      );
    });
  });

  describe.each`
    darkModeConfig                   | expectedSelector
    ${undefined}                     | ${"@media (prefers-color-scheme: dark) { :root"}
    ${"media"}                       | ${"@media (prefers-color-scheme: dark) { :root"}
    ${["media", ".something"]}       | ${"@media (prefers-color-scheme: dark) { :root"}
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
              raw: "bg-a text-a border-a/50 dark something custom-selector",
            },
          ],
          theme: {
            borderColor: {
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
          .border-a\\/50 {
            border-color: rgb(var(--color-border-a) / 0.5)
          }
          `.replace(/\n|\s|\t/g, "")
        );

        let baseCSS = postcss([require("tailwindcss")(config)]).process(
          "@tailwind base"
        ).css;

        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `:root {
          --color-border-a: 255 255 255;
        }`.replace(/\n|\s|\t/g, "")
        );
        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `${expectedSelector} {
          --color-border-a: 0 0 0;
        }`.replace(/\n|\s|\t/g, "")
        );
      });
    }
  );
});
