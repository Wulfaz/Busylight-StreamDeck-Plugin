import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

/** @type {import('rollup').RollupOptions} */
export default {
    input: "src/plugin.ts",
    output: {
        file: "net.wulfaz.busylight.sdPlugin/bin/plugin.js",
        format: "cjs",
        sourcemap: true,
        exports: "auto",
    },
    plugins: [
        typescript(),
        nodeResolve({ browser: false, exportConditions: ["node"] }),
        commonjs(),
    ],
};
