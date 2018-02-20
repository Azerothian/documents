

import util from "util";
import debug from "debug";
import path from "path";
import uuid from "uuid/v4";
import puppeteer from "puppeteer";
import fm from "front-matter";
import tempfs from "temp-fs";
import fs from "fs";

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
      md.renderer.rules.fence = (tokens, idx, options) => {
        return this.fence({tokens, idx, options, next: (opts = {tokens, idx, options}) => next(opts.tokens, opts.idx, opts.options)});
      };
    };
  }
  fence(opts) {
    const {tokens, idx, options, next} = opts;
    var token = tokens[idx];
    if (token.info === "puppet") {
      const fileName = `${uuid()}.png`;
      const src = path.resolve(this.tempDir.path, fileName);
      this.jobs.push({src, token, fileName});
      return `<img src="file://${src.replace(/(\\)/g, "/")}" />`;
    }
    return next(opts);
  }
  async render() {
    return this.jobs.reduce((p, j) => {
      return p.then(async() => {
        const page = await this.browser.newPage();
        const {attributes, body} = fm(j.token.content);
        // log("ATTRGIBUTES", attributes);
        if (attributes.viewport) {
          page.setViewport(attributes.viewport);
        }
        let contents = body;
        let renderFile;
        if (!attributes.plugin && attributes.file) {
          renderFile = `file://${path.resolve(this.options.cwd, attributes.file)}`;
        } else if (attributes.plugin && attributes.file) {
          const targetFile = path.resolve(this.options.cwd, attributes.file);
          log("targetFile", targetFile);
          contents = await readFileAsync(targetFile, {encoding: "utf8"});
          const plugin = this.plugins[attributes.plugin];
          const ptempFile = path.resolve(this.tempDir.path, `${uuid()}.html`);
          await writeFileAsync(ptempFile, plugin.html(), "utf8");
          renderFile = `file://${ptempFile}`;
        } else {
          const tempFile = path.resolve(this.tempDir.path, `${uuid()}.html`);
          await writeFileAsync(tempFile, contents, "utf8");
          renderFile = `file://${tempFile}`;
        }
        await page.goto(renderFile, {waitUntil: "networkidle2"});
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
        await page.screenshot({
          path: j.src,
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
