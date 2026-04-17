import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

let theQueries = ["findAllBy", "findBy", "getAllBy", "getBy", "queryAllBy", "queryBy"].flatMap(
  (prefix) =>
    [
      "AltText",
      "DisplayValue",
      "LabelText",
      "PlaceholderText",
      "Role",
      "TestId",
      "Text",
      "Title",
    ].map((element) => `${prefix}${element}`),
);

export const resolveQueries = (loadModule = require) => {
  try {
    const { queries: allQueries } = loadModule("@testing-library/dom");
    return Object.keys(allQueries);
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") {
      throw error;
    }
  }

  return theQueries;
};

theQueries = resolveQueries();

export const queries = theQueries;
