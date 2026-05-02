// @ts-check

/** @type {import("lint-staged").Configuration} */
const config = {
  "**/*": ["prettier --write --ignore-unknown"],
  "**/*.{js,cjs,mjs}": [
    "eslint --fix --max-warnings=0 --report-unused-disable-directives --no-warn-ignored",
  ],
};

export default config;
