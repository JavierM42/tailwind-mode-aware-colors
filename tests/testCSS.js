const postcss = require("postcss");
const withModeAwareColors = require("../src/index");

it("Generates correct CSS", () => {
  let css = postcss([
    require("tailwindcss")(
      withModeAwareColors({
        content: [
          {
            raw: "bg-a text-a/50",
          },
        ],
        theme: {
          colors: {
            a: {
              light: "#ffffff",
              dark: "#000000",
            },
          },
        },
      })
    ),
  ]);

  expect(css).toBe("".trim());
});
