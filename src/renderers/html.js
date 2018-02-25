
// import util from "util";
// import path from "path";
import debug from "debug";
// import puppeteer from "puppeteer";
// import fs from "fs-extra";
// import globby from "globby";

// const writeFileAsync = util.promisify(fs.writeFile);
import copyAll from "../utils/copy-all";
const log = debug("documents::renderers:html:");



export default async function puppeteerRenderer({renderFile, output, targetDir}) {
  return copyAll(targetDir, output);
}
