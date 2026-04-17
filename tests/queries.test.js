import { queries, resolveQueries } from "../src/queries.js";

describe("when @testing-library/dom is not available", () => {
  it("uses the default queries", () => {
    const fallbackQueries = resolveQueries(() => {
      const error = new Error("module not found");
      error.code = "MODULE_NOT_FOUND";
      throw error;
    });

    expect([...fallbackQueries].sort()).toStrictEqual([
      "findAllByAltText",
      "findAllByDisplayValue",
      "findAllByLabelText",
      "findAllByPlaceholderText",
      "findAllByRole",
      "findAllByTestId",
      "findAllByText",
      "findAllByTitle",
      "findByAltText",
      "findByDisplayValue",
      "findByLabelText",
      "findByPlaceholderText",
      "findByRole",
      "findByTestId",
      "findByText",
      "findByTitle",
      "getAllByAltText",
      "getAllByDisplayValue",
      "getAllByLabelText",
      "getAllByPlaceholderText",
      "getAllByRole",
      "getAllByTestId",
      "getAllByText",
      "getAllByTitle",
      "getByAltText",
      "getByDisplayValue",
      "getByLabelText",
      "getByPlaceholderText",
      "getByRole",
      "getByTestId",
      "getByText",
      "getByTitle",
      "queryAllByAltText",
      "queryAllByDisplayValue",
      "queryAllByLabelText",
      "queryAllByPlaceholderText",
      "queryAllByRole",
      "queryAllByTestId",
      "queryAllByText",
      "queryAllByTitle",
      "queryByAltText",
      "queryByDisplayValue",
      "queryByLabelText",
      "queryByPlaceholderText",
      "queryByRole",
      "queryByTestId",
      "queryByText",
      "queryByTitle",
    ]);
  });
});

describe("when @testing-library/dom is available", () => {
  it("returns the queries from the library", () => {
    expect([...queries].sort()).toStrictEqual([
      "findAllByAltText",
      "findAllByDisplayValue",
      "findAllByLabelText",
      "findAllByPlaceholderText",
      "findAllByRole",
      "findAllByTestId",
      "findAllByText",
      "findAllByTitle",
      "findByAltText",
      "findByDisplayValue",
      "findByLabelText",
      "findByPlaceholderText",
      "findByRole",
      "findByTestId",
      "findByText",
      "findByTitle",
      "getAllByAltText",
      "getAllByDisplayValue",
      "getAllByLabelText",
      "getAllByPlaceholderText",
      "getAllByRole",
      "getAllByTestId",
      "getAllByText",
      "getAllByTitle",
      "getByAltText",
      "getByDisplayValue",
      "getByLabelText",
      "getByPlaceholderText",
      "getByRole",
      "getByTestId",
      "getByText",
      "getByTitle",
      "queryAllByAltText",
      "queryAllByDisplayValue",
      "queryAllByLabelText",
      "queryAllByPlaceholderText",
      "queryAllByRole",
      "queryAllByTestId",
      "queryAllByText",
      "queryAllByTitle",
      "queryByAltText",
      "queryByDisplayValue",
      "queryByLabelText",
      "queryByPlaceholderText",
      "queryByRole",
      "queryByTestId",
      "queryByText",
      "queryByTitle",
    ]);
  });

  it("re-throws unexpected errors", () => {
    expect(() =>
      resolveQueries(() => {
        throw new Error("oh noes!");
      }),
    ).toThrow(/oh noes!/iu);
  });
});
