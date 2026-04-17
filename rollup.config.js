// @ts-check

import { builtinModules } from "node:module";

const externalIds = new Set([
  "@testing-library/dom",
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`),
]);

export default {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "esm",
    sourcemap: true,
  },
  external: (id) => externalIds.has(id),
  treeshake: true,
};
