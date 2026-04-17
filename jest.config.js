// @ts-check

/** @type {import("jest").Config} */
const config = {
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.js"],
  coverageProvider: "v8",
  extensionsToTreatAsEsm: [],
  moduleFileExtensions: ["js", "json"],
  restoreMocks: true,
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  transform: {},
};

export default config;
