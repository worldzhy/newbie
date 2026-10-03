import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import typescript from "rollup-plugin-typescript";
import resolve from "rollup-plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import fs from "fs";
import path from "path";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const distDir = path.resolve("dist");

function cleanDist() {
  return {
    name: "clean-dist",
    buildStart() {
      try {
        if (fs.existsSync(distDir)) {
          try {
            fs.rmSync(distDir, { recursive: true, force: true });
          } catch (e) {
            try {
              fs.rmdirSync(distDir, { recursive: true });
            } catch (e2) {
              const remove = (p) => {
                if (!fs.existsSync(p)) return;
                const s = fs.statSync(p);
                if (s.isDirectory()) {
                  fs.readdirSync(p).forEach((n) => remove(path.join(p, n)));
                  fs.rmdirSync(p);
                } else {
                  fs.unlinkSync(p);
                }
              };
              remove(distDir);
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    },
  };
}

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "umd",
      name: "frontend-monitor",
      sourcemap: false,
      exports: "named",
    },
  ],
  plugins: [
    cleanDist(),
    getBabelOutputPlugin({
      presets: ["@babel/preset-env"],
      plugins: ["@babel/plugin-transform-spread"],
      allowAllFormats: true,
    }),
    resolve({ extensions: [".mjs", ".js", ".jsx", ".json", ".ts", ".tsx"] }),
    typescript(),
    replace({
      preventAssignment: true,
      "rollup.replace.WEB_VERSION": pkg.version,
    }),
  ],
};
