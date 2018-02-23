// #!/usr/bin/env node
// import util from "util";
import minimist from "minimist";
// import fs from "fs";
// import path from "path";
import debug from "debug";
debug.enable("documents:*");
// const existsAsync = util.promisify(fs.exists);
// const readFileAsync = util.promisify(fs.readFile);
const args = minimist(process.argv.slice(2));
// const log = debug("documents:index:");
import renderer from "./renderer";
(async function() {
  if (args._.length === 1) {
    return renderer(args._[0]);
  }
  return renderer("./index.json");
})();
