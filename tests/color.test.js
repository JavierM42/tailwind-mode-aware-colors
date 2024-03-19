const withModeAwareColors = require("../src/index");
const postcss = require("postcss", { async: true });

describe("color theme", () => {
  const config = withModeAwareColors({
    theme: {
      colors: {
        a: {
          light: "#ffffff",
          dark: "#000000",
        },
        b: {
          light: "rgb(255, 255, 255)",
          dark: "rgb(0, 0, 0)",
        },
        c: {
          light: "#ffffff33",
          dark: "#00000033",
        },
        d: {
          light: "rgba(255, 255, 255, 0.2)",
          dark: "rgba(0, 0, 0, 0.2)",
        },
      },
    },
  });

  it("Flattens color map and adds mode aware colors", () => {
    expect(config).toEqual(
      expect.objectContaining({
        theme: {
          colors: {
            a: expect.any(Function),
            "a-light": "#ffffff",
            "a-dark": "#000000",
            b: expect.any(Function),
            "b-light": "rgb(255, 255, 255)",
            "b-dark": "rgb(0, 0, 0)",
            c: expect.any(Function),
            "c-light": "#ffffff33",
            "c-dark": "#00000033",
            d: expect.any(Function),
            "d-light": "rgba(255, 255, 255, 0.2)",
            "d-dark": "rgba(0, 0, 0, 0.2)",
          },
        },
      })
    );
  });

  it("Defines mode aware colors as functions based on opacity", () => {
    const a = config.theme.colors.a;
    const b = config.theme.colors.b;
    const c = config.theme.colors.c;
    const d = config.theme.colors.d;
    expect(a({})).toEqual("rgb(var(--color-a) / var(--opacity-a, 1))");
    expect(a({ opacityValue: 0.4 })).toEqual("rgb(var(--color-a) / 0.4)");
    expect(a({ opacityValue: "var(--something)" })).toEqual(
      "rgb(var(--color-a) / var(--opacity-a, var(--something)))"
    );
    expect(b({})).toEqual("rgb(var(--color-b) / var(--opacity-b, 1))");
    expect(b({ opacityValue: 0.4 })).toEqual("rgb(var(--color-b) / 0.4)");
    expect(b({ opacityValue: "var(--something)" })).toEqual(
      "rgb(var(--color-b) / var(--opacity-b, var(--something)))"
    );
    expect(c({})).toEqual("rgb(var(--color-c) / var(--opacity-c, 1))");
    expect(c({ opacityValue: 0.4 })).toEqual("rgb(var(--color-c) / 0.4)");
    expect(c({ opacityValue: "var(--something)" })).toEqual(
      "rgb(var(--color-c) / var(--opacity-c, var(--something)))"
    );
    expect(d({})).toEqual("rgb(var(--color-d) / var(--opacity-d, 1))");
    expect(d({ opacityValue: 0.4 })).toEqual("rgb(var(--color-d) / 0.4)");
    expect(d({ opacityValue: "var(--something)" })).toEqual(
      "rgb(var(--color-d) / var(--opacity-d, var(--something)))"
    );
  });

  describe("extend", () => {
    const config = withModeAwareColors({
      theme: {
        extend: {
          colors: {
            a: {
              light: "#ffffff",
              dark: "#000000",
            },
            b: {
              light: "rgb(255, 255, 255)",
              dark: "rgb(0, 0, 0)",
            },
            c: {
              light: "#ffffff33",
              dark: "#00000033",
            },
            d: {
              light: "rgba(255, 255, 255, 0.2)",
              dark: "rgba(0, 0, 0, 0.2)",
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
              colors: {
                a: expect.any(Function),
                "a-light": "#ffffff",
                "a-dark": "#000000",
                b: expect.any(Function),
                "b-light": "rgb(255, 255, 255)",
                "b-dark": "rgb(0, 0, 0)",
                c: expect.any(Function),
                "c-light": "#ffffff33",
                "c-dark": "#00000033",
                d: expect.any(Function),
                "d-light": "rgba(255, 255, 255, 0.2)",
                "d-dark": "rgba(0, 0, 0, 0.2)",
              },
            },
          },
        })
      );
    });

    it("Defines mode aware colors as functions based on opacity", () => {
      const a = config.theme.extend.colors.a;
      const b = config.theme.extend.colors.b;
      const c = config.theme.extend.colors.c;
      const d = config.theme.extend.colors.d;
      expect(a({})).toEqual("rgb(var(--color-a) / var(--opacity-a, 1))");
      expect(a({ opacityValue: 0.4 })).toEqual("rgb(var(--color-a) / 0.4)");
      expect(a({ opacityValue: "var(--something)" })).toEqual(
        "rgb(var(--color-a) / var(--opacity-a, var(--something)))"
      );
      expect(b({})).toEqual("rgb(var(--color-b) / var(--opacity-b, 1))");
      expect(b({ opacityValue: 0.4 })).toEqual("rgb(var(--color-b) / 0.4)");
      expect(b({ opacityValue: "var(--something)" })).toEqual(
        "rgb(var(--color-b) / var(--opacity-b, var(--something)))"
      );
      expect(c({})).toEqual("rgb(var(--color-c) / var(--opacity-c, 1))");
      expect(c({ opacityValue: 0.4 })).toEqual("rgb(var(--color-c) / 0.4)");
      expect(c({ opacityValue: "var(--something)" })).toEqual(
        "rgb(var(--color-c) / var(--opacity-c, var(--something)))"
      );
      expect(d({})).toEqual("rgb(var(--color-d) / var(--opacity-d, 1))");
      expect(d({ opacityValue: 0.4 })).toEqual("rgb(var(--color-d) / 0.4)");
      expect(d({ opacityValue: "var(--something)" })).toEqual(
        "rgb(var(--color-d) / var(--opacity-d, var(--something)))"
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
                light: "rgb(255, 255, 255)",
                dark: "rgb(0, 0, 0)",
              },
              c: {
                light: "#ffffff33",
                dark: "#00000033",
              },
              d: {
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
            .bg-a {
              --tw-bg-opacity: 1;
              background-color: rgb(var(--color-a) / var(--opacity-a, var(--tw-bg-opacity)))
            }
            .bg-b {
              --tw-bg-opacity: 1;
              background-color: rgb(var(--color-b) / var(--opacity-b, var(--tw-bg-opacity)))
            }
            .bg-c {
              --tw-bg-opacity: 1;
              background-color: rgb(var(--color-c) / var(--opacity-c, var(--tw-bg-opacity)))
            }
            .bg-d {
              --tw-bg-opacity: 1;
              background-color: rgb(var(--color-d) / var(--opacity-d, var(--tw-bg-opacity)))
            }
            .text-a\\/50 {
              color: rgb(var(--color-a) / 0.5)
            }
            .text-b\\/50 {
              color: rgb(var(--color-b) / 0.5)
            }
            .text-c\\/50 {
              color: rgb(var(--color-c) / 0.5)
            }
            .text-d\\/50 {
              color: rgb(var(--color-d) / 0.5)
            }
          `.replace(/\n|\s|\t/g, "")
        );

        let baseCSS = postcss([require("tailwindcss")(config)]).process(
          "@tailwind base"
        ).css;

        expect(baseCSS.replace(/\n|\s|\t/g, "")).toContain(
          `:root {
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
