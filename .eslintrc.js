module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecaVersion: 13,
    sourceType: "module",
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  rules: {},
};
