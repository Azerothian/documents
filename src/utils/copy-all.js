
import util from "util";
import fs from "fs-extra";
import globby from "globby";
import path from "path";
import debug from "debug";
const copyFileAsync = util.promisify(fs.copyFile);
const ensureDirAsync = util.promisify(fs.ensureDir);
const log = debug("documents::utils:copy-all:");

export default async function copyAll(src, dest, exclude = ["!**/*.md"]) {
  if (!src) {
    throw new Error("src is undefined");
  }
  if (!dest) {
    throw new Error("dest is undefined");
  }
  // log("copyAll", {src, dest});
  const files = await globby(["**/*"].concat(exclude), {
    cwd: src,
  });
  // log("copyAll - files", files);
  return Promise.all(files.map(async(f) => {
    // log("target", f);
    if (f !== ".") {
      await ensureDirAsync(path.resolve(dest, path.dirname(f)));
    }
    const from = path.resolve(src, f);
    const to = path.resolve(dest, f);
    // log("copy", {from, to});
    return copyFileAsync(from, to);
  }));
}
