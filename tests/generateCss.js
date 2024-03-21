const postcss = require("postcss");

const generateCss = async (string, config) =>
  await postcss([require("tailwindcss")(config)])
    .process(string, { from: undefined })
    .then((result) => result.css.replace(/\n|\s|\t/g, ""));

module.exports = generateCss;
