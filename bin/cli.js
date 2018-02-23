#!/usr/bin/env node
const minimist = require("minimist");
const debug = require("debug");
debug.enable("documents:*");
const args = minimist(process.argv.slice(2));
const renderer = require("../build/renderer").default;
if (args._.length === 1) {
  renderer(args._[0]);
} else {
  renderer("./index.json");
}
