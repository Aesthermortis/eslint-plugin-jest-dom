import { queries, resolveQueries } from "../src/queries.js";

describe("when @testing-library/dom is not available", () => {
  it("uses the default queries", async () => {
    const fallbackQueries = await resolveQueries(() => {
      const error = new Error("module not found");
      error.code = "ERR_MODULE_NOT_FOUND";

      return Promise.reject(error);
    });

    expect([...fallbackQueries].toSorted((a, b) => a.localeCompare(b))).toStrictEqual([
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
    expect([...queries].toSorted((a, b) => a.localeCompare(b))).toStrictEqual([
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

  it("re-throws unexpected errors", async () => {
    await expect(resolveQueries(() => Promise.reject(new Error("oh noes!")))).rejects.toThrow(
      /oh noes!/iu,
    );
  });
});
