

import util from "util";
import debug from "debug";
import path from "path";
import uuid from "uuid/v4";
import puppeteer from "puppeteer";
import fm from "front-matter";
import tempfs from "temp-fs";
import fs from "fs";



import copyAll from "../utils/copy-all";

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const log = debug("documents::plugins:puppet:");

const tempfsMkdir = util.promisify(tempfs.mkdir);

const tempDirOptions = {
  dir: ".",
  recursive: true,
  track: true,
};
// let plugins = {};


export default class PuppetPlugin {
  constructor(opts = {}) {
    this.options = opts;
    this.plugins = {};
    if (this.options.plugins) {
      this.options.plugins.forEach(p => this.addPlugin(p));
    }
    this.jobs = [];
  }
  addPlugin(plugin) {
    this.plugins[plugin.name] = plugin;
  }
  async initialize() {
    this.tempDir = await tempfsMkdir(tempDirOptions);
    this.browser = await puppeteer.launch({
      // headless: false,
      // slowMo: 1000 // slow down by 250ms
    });
    return;
  }
  async close() {
    await this.browser.close();
    return this.tempDir.unlink();
  }
  register() {
    return (md, userOptions) => {
      this.mdOptions = userOptions;
      this.md = md;
      const next = md.renderer.rules.fence;
      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        return this.fence({tokens, idx, options, env, slf, next: (opts = {tokens, idx, options, env, slf}) => next(opts.tokens, opts.idx, opts.options, opts.env, opts.slf)});
      };
    };
  }
  fence(opts) {
    const {tokens, idx, options, next} = opts;
    var token = tokens[idx];
    if (token.info === "puppet") {
      const fileName = `${uuid()}.png`;
      const outputFile = path.resolve(this.options.outputDir, fileName);
      const relativeDir = path.relative(this.options.relativeDir, outputFile);
      const fmOutput = fm(token.content);
      this.jobs.push({outputFile, relativeDir, token, fileName, fm: fmOutput});
      let attrs = "";
      if (fmOutput.attributes.attrs) {
        attrs = Object.keys(fmOutput.attributes.attrs).reduce((s, k) => {
          if (fmOutput.attributes.attrs[k] === true) {
            s += ` ${k}`;
          } else {
            s += ` ${k}="${fmOutput.attributes.attrs[k]}"`;
          }
          return s;
        }, "");
      }


      return `<img ${attrs} src="./${relativeDir.replace(/(\\)/g, "/")}" />`;
    }
    return next(opts);
  }
  async render() {
    return this.jobs.reduce((p, j) => {
      return p.then(async() => {
        await copyAll(this.options.workingDir, this.tempDir.path);
        const page = await this.browser.newPage();
        // log("ATTRGIBUTES", attributes);
        const {attributes, body} = j.fm;
        if (attributes.viewport) {
          page.setViewport(attributes.viewport);
        }
        let contents = body;
        let renderFile = path.resolve(this.tempDir.path, "index.html");
        if (!attributes.plugin && attributes.file) {
          renderFile = await path.resolve(this.options.relativeDir, attributes.file);
        } else if (attributes.plugin && attributes.file) {
          const targetFile = path.resolve(this.options.workingDir, attributes.file);
          contents = await readFileAsync(targetFile, {encoding: "utf8"});
          const plugin = this.plugins[attributes.plugin];
          // renderFile = path.resolve(this.options.relativeDir, attributes.file);
          const html = await plugin.html(attributes.options || {});
          log("writing html from plugin and file", renderFile);
          await writeFileAsync(renderFile, html, "utf8");
        } else if (attributes.plugin && !attributes.file) {
          const plugin = this.plugins[attributes.plugin];
          const html = await plugin.html();
          log("writing html from plugin", renderFile);
          await writeFileAsync(renderFile, html, "utf8");
        } else {
          log("writing html from inline", renderFile);
          await writeFileAsync(renderFile, contents, "utf8");
        }
        await page.goto(`file://${renderFile.replace(/(\\)/g, "/")}`, {waitUntil: "networkidle2"});
        await page.evaluate(async(options) => {
          try {
            if (window.render) {
              return window.render(options);
            }
            return Promise.resolve();
          } catch (e) {
            return Promise.reject(e);
          }
        }, {attributes, contents, token: j.token});
        log("image output", j.outputFile);
        await page.screenshot({
          path: j.outputFile,
          omitBackground: true,
          fullPage: true,
        });
        return page.close();
      });
    }, Promise.resolve());
  }

}

// export default function puppetPlugin(markdownit, userOptions) {
//   const next = markdownit.renderer.rules.fence;
//   markdownit.renderer.rules.fence = (tokens, idx, options) => {
//     return fence({tokens, idx, options, next: (opts = {tokens, idx, options}) => next(opts.tokens, opts.idx, opts.options)});
//   };
// }
// puppetPlugin.register = function register(plugin) {

// }
