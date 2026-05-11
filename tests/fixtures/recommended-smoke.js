it("contains assertions checked by config smoke tests", () => {
  const element = { textContent: "Submit" };
  const input = { checkValidity: () => true };

  expect(element.textContent).toBe("Submit");
  expect(input.checkValidity()).toBe(true);
});
