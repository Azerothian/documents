
import util from "util";
import minimist from "minimist";
import fs from "fs";
import path from "path";
import debug from "debug";

debug.enable("documents:*");
const existsAsync = util.promisify(fs.exists);
const readFileAsync = util.promisify(fs.readFile);
const args = minimist(process.argv.slice(2));

const log = debug("documents:index:");
import renderer from "./renderer";


(async function() {
  const targetDir = args.dir || process.cwd();
  let options = {
    files: "**/*.md",
    targetDir: targetDir,
  };
  const configPath = path.resolve(targetDir, "index.json");
  if (await existsAsync(configPath)) {
    options = Object.assign(options, JSON.parse(await readFileAsync(path, {encoding: "utf8"})));
  }
  await renderer(options);

  return undefined;
})();
