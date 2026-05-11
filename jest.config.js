// @ts-check

/** @type {import("jest").Config} */
const config = {
  // Auto-clear and restore spies/mocks between tests.
  clearMocks: true,

  // Collect coverage from source files, excluding test files.
  collectCoverageFrom: ["src/**/*.js", "!src/**/?(*.)+(spec|test).[cm]js"],

  // Ignore coverage for node_modules and build output.
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],

  // Use V8's built-in code coverage for faster and more accurate results.
  coverageProvider: "v8",

  // Enforce 100% coverage globally.
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },

  // Automatically reset spies/mocks between tests.
  resetMocks: true,

  // Automatically restore spies/mocks to their original implementations.
  restoreMocks: true,

  // Look for modules under src/ when resolving imports.
  roots: ["<rootDir>/src", "<rootDir>/tests"],

  testEnvironment: "node",

  // Discover *.test.* or *.spec.* files within the dedicated tests/ folder.
  testMatch: ["<rootDir>/tests/**/*.{spec,test}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],

  extensionsToTreatAsEsm: [],

  moduleFileExtensions: ["js", "json"],

  transform: {},
};

export default config;
