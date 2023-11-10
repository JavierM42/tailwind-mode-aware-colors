const withModeAwareColors = require("../src/index");

describe("When mode-aware color key is already defined", () => {
  it("Throws", () => {
    expect(() =>
      withModeAwareColors({
        theme: {
          colors: {
            a: {
              DEFAULT: "#aaaaaa",
              light: "#ffffff",
              dark: "#000000",
            },
          },
        },
      })
    ).toThrow();
  });
});
