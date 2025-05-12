// rollup.config.js (CommonJS)
const typescript = require("@rollup/plugin-typescript");

/** @type {import('rollup').RollupOptions[]} */
module.exports = [
  {
    input: "src/index.ts",
    output: [
      { file: "dist/esm/index.js", format: "es" },
      { file: "dist/cjs/index.js", format: "cjs" },
      { file: "dist/umd/index.js", format: "umd", name: "BacktestV2" },
    ],
    plugins: [typescript({ tsconfig: "./tsconfig.json" })],
  },
];
