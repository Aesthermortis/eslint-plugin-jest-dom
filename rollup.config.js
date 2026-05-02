// @ts-check

import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "es",
    importAttributesKey: "with",
    sourcemap: true,
  },
  external: ["@testing-library/dom", "../package.json", "node:module"],
  plugins: [nodeResolve()],
};
