import typescript from "@rollup/plugin-typescript";
// import pkg from "./package.json" assert { type: "json" };

import { readFile } from "fs/promises";

const pkg = JSON.parse(
  await readFile(new URL("./package.json", import.meta.url))
);

export default {
  input: "./src/index.ts",
  output: [
    {
      format: "cjs",
      file: pkg.main,
    },
    {
      format: "es",
      file: pkg.module,
    },
  ],
  plugins: [typescript()],
};
