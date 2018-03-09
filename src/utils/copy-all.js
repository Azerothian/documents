
import util from "util";
import fse from "fs-extra";
import fs from "fs";
import globby from "globby";
import path from "path";
import debug from "debug";
const copyFileAsync = util.promisify(fse.copyFile);
const ensureDirAsync = util.promisify(fse.ensureDir);
const existsAsync = util.promisify(fs.exists);
const log = debug("documents::utils:copy-all:");

export default async function copyAll(src, dest, exclude = ["!**/*.md", "!**/tmp-*"]) {
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
    
    if (f !== ".") {
      await ensureDirAsync(path.resolve(dest, path.dirname(f)));
    }
    const from = path.resolve(src, f);
    const to = path.resolve(dest, f);
    log("target", to);
    if (!(await existsAsync(to))) {
      await copyFileAsync(from, to);
    }
    return undefined;
    
  }));
}
