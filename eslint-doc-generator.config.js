/** @type {import("eslint-doc-generator").GenerateOptions} */
const config = {
  configEmoji: [["recommended", "✅"]],
  ruleDocSectionOptions: false,

  async postprocess(content, path) {
    const prettier = await import("prettier");
    const prettierConfig = await prettier.resolveConfig(path);

    return prettier.format(content, {
      ...prettierConfig,
      filepath: path,
      parser: "markdown",
    });
  },
};

export default config;
