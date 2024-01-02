const withModeAwareColors = require("../src/index");
const postcss = require("postcss");

describe("outlineColor theme", () => {
  const config = withModeAwareColors({
    theme: {
      outlineColor: {
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
          outlineColor: {
            a: expect.any(Function),
            "a-light": "#ffffff",
            "a-dark": "#000000",
          },
        },
      })
    );
  });

  it("Defines mode aware color as a function based on opacity", () => {
    const a = config.theme.outlineColor.a;
    expect(a({})).toEqual(
      "rgb(var(--color-outline-a) / var(--opacity-outline-a, 1))"
    );
    expect(a({ opacityValue: 0.4 })).toEqual(
      "rgb(var(--color-outline-a) / 0.4)"
    );
    expect(a({ opacityValue: "var(--tw-outline-opacity)" })).toEqual(
      "rgb(var(--color-outline-a) / var(--opacity-outline-a, var(--tw-outline-opacity)))"
    );
  });

  describe("extend", () => {
    const config = withModeAwareColors({
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
    });

    it("Flattens extend color map and adds mode aware color", () => {
      expect(config).toEqual(
        expect.objectContaining({
          theme: {
            extend: {
              outlineColor: {
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
      const a = config.theme.extend.outlineColor.a;
      expect(a({})).toEqual(
        "rgb(var(--color-outline-a) / var(--opacity-outline-a, 1))"
      );
      expect(a({ opacityValue: 0.4 })).toEqual(
        "rgb(var(--color-outline-a) / 0.4)"
      );
      expect(a({ opacityValue: "var(--tw-outline-opacity)" })).toEqual(
        "rgb(var(--color-outline-a) / var(--opacity-outline-a, var(--tw-outline-opacity)))"
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
              raw: "bg-a/50 text-a border-a outline-b outline-b/50 outline-a dark something custom-selector",
            },
          ],
          theme: {
            outlineColor: {
              a: {
                light: "#ffffff",
                dark: "#000000",
              },
              b: {
                light: "rgba(255, 255, 255, 0.2)",
                dark: "rgba(0, 0, 0, 0.2)",
              },
            },
          },
        });

        let utilitiesCSS = postcss([require("tailwindcss")(config)]).process(
          "@tailwind utilities"
        ).css;

        expect(utilitiesCSS.replace(/\n|\s|\t/g, "")).toBe(
          `
          .outline-a {
            outline-color: rgb(var(--color-outline-a) / var(--opacity-outline-a, 1))
          }
          .outline-b {
            outline-color: rgb(var(--color-outline-b) / var(--opacity-outline-b, 1))
          }
          .outline-b\\/50 {
            outline-color: rgb(var(--color-outline-b) / 0.5)
          }
          `.replace(/\n|\s|\t/g, "")
        );

        let baseCSS = postcss([require("tailwindcss")(config)]).process(
          "@tailwind base"
        ).css;

        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `:root {
          --color-outline-a: 255 255 255;
          --color-outline-b: 255 255 255;
          --opacity-outline-b: 20%;
        }`.replace(/\n|\s|\t/g, "")
        );
        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `${expectedSelector} {
          --color-outline-a: 0 0 0;
          --color-outline-b: 0 0 0;
          --opacity-outline-b: 20%;
        }`.replace(/\n|\s|\t/g, "")
        );
      });
    }
  );
});
