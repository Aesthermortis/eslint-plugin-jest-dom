const baseQueryPrefixes = ["findAllBy", "findBy", "getAllBy", "getBy", "queryAllBy", "queryBy"];

const baseQueryVariants = [
  "AltText",
  "DisplayValue",
  "LabelText",
  "PlaceholderText",
  "Role",
  "TestId",
  "Text",
  "Title",
];

const baseQueries = baseQueryPrefixes.flatMap((prefix) =>
  baseQueryVariants.map((variant) => `${prefix}${variant}`),
);

/** @typedef {{ queries: Record<string, unknown> }} TestingLibraryDomModule */

/**
 * @param {unknown} error - Value thrown while loading a module.
 * @returns {error is Error & { code: string }} Whether the value is an Error with a string code.
 */
const hasErrorCode = (error) =>
  error instanceof Error && "code" in error && typeof error.code === "string";

/**
 * @param {unknown} error - Value thrown while loading the optional peer dependency.
 * @returns {boolean} Whether the error is for a missing optional peer dependency.
 */
const isOptionalPeerMissing = (error) =>
  hasErrorCode(error) && error.code === "ERR_MODULE_NOT_FOUND";

/** @returns {Promise<TestingLibraryDomModule>} The imported Testing Library DOM module. */
const importTestingLibraryDom = async () => import("@testing-library/dom");

/**
 * @param {() => Promise<TestingLibraryDomModule>} [loadModule] - Function that loads Testing Library DOM.
 * @returns {Promise<string[]>} Available Testing Library query names.
 */
export const resolveQueries = async (loadModule = importTestingLibraryDom) => {
  try {
    const { queries: testingLibraryQueries } = await loadModule();

    return Object.keys(testingLibraryQueries);
  } catch (error) {
    if (!isOptionalPeerMissing(error)) {
      throw error;
    }

    return baseQueries;
  }
};

export const queries = await resolveQueries();
