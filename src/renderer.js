
import util from "util";
import debug from "debug";
import globby from "globby";
import tempfs from "temp-fs";
import path from "path";
import fs from "fs-extra";
import MarkdownIt from "markdown-it";
import fm from "front-matter";

import "source-map-support/register";

import copyAll from "./utils/copy-all";
import pandocRenderer from "./renderers/pandoc";
import puppeteerRenderer from "./renderers/puppeteer";
import htmlRenderer from "./renderers/html";
import promiseFall from "./utils/promise-fall";


import PuppetPlugin from "./plugins/puppet";
import MarkdownItPlugin from "./plugins/markdown-it";
// import BootstrapStylePlugin from "./plugins/bootstrap-style";



const tempfsMkdir = util.promisify(tempfs.mkdir);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
// const ensureDirAsync = util.promisify(fs.ensureDir);

const plugins = [PuppetPlugin, MarkdownItPlugin];

const log = debug("documents::renderer:");

const tempDirOptions = {
  dir: ".",
  recursive: true,
  track: true,
};
async function createThemeHeader(tempDirPath) {
  const themeItems = await globby("./theme/**/*", {
    cwd: tempDirPath,
  });
  log("themeItems", themeItems);
  return themeItems.reduce((s, v) => {
    log("themeItem", v);
    switch (path.extname(v)) {
      case ".js":
        s += `<script src="${v}"></script>`;
        break;
      case ".css":
        s += `<link rel="stylesheet" href="${v}" />`;
        break;
    }
    return s;
  }, "");
}

async function extractFiles({files, targetDir}) {
  if (typeof files === "string") {
    return globby(files, {
      cwd: targetDir,
    });
  } else {
    return files;
  }
}
async function renderHtml(targetFiles, sourceDir, projectDir, options, md, plugins) {
  log("renderHtml", {targetFiles, sourceDir, projectDir});
  return Promise.all(targetFiles.map(async(file) => {
    const fileData = await readFileAsync(path.resolve(sourceDir, file), {encoding: "utf8"});
    const fmExtract = fm(fileData);
    const processed = await (promiseFall(plugins, "before")({body: fmExtract.body, fmExtract, fileData, options, projectDir, sourceDir}));
    const outputTarget = path.resolve(projectDir, path.dirname(file), `${path.basename(file, path.extname(file))}.html`);
    const content = md.render(processed.body);
    return {
      path: file,
      content,
      header: fmExtract.attributes,
      outputTarget,
    };
  }));
}
async function writeFiles(contents) {
  await Promise.all(contents.map(async(c) => {
    log("writing file", c.outputTarget);
    if (path.dirname(c.path) !== ".") {
      await fs.ensureDir(path.dirname(c.outputTarget));
    }
    await writeFileAsync(c.outputTarget, c.content, "utf8");
  }));
}


export default async function renderer(opts) {
  let tempDir;
  try {
    let sourceDir, outputFile;
    let options = opts;
    if (typeof opts === "string") {
      sourceDir = path.dirname(path.resolve(process.cwd(), opts));
      options = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), opts)));
      outputFile = path.resolve(process.cwd(), path.dirname(opts), options.output);
      // log("###############", {cwd: process.cwd(), opts: path.dirname(opts), output: options.output, outputFile});
    }
    if (options.dir) {
      sourceDir = options.dir;
    }
    // log("opts", options);
    tempDir = await tempfsMkdir(tempDirOptions);
    const renderFile = path.resolve(tempDir.path, "index.html");
    const targetOpts = {
      renderFile,
      dir: tempDir.path,
      staticDir: path.resolve(tempDir.path, options.static),
      themeDir: path.resolve(tempDir.path, "./theme"),
      contentDir: path.resolve(tempDir.path, "./content/"),
    };
    const sourceOpts = {
      dir: sourceDir,
      staticDir: path.resolve(sourceDir, options.static),
      themeDir: path.resolve(sourceDir, options.theme),
    };
    await fs.ensureDir(targetOpts.staticDir);
    await fs.ensureDir(targetOpts.themeDir);
    await fs.ensureDir(targetOpts.contentDir);
    log("copy static");
    await copyAll(sourceOpts.staticDir, targetOpts.staticDir);
    log("copy theme");
    await copyAll(sourceOpts.themeDir, targetOpts.themeDir);

    const files = await extractFiles(options);
    const initPlugins = plugins.map((Plugin) => new Plugin({
      target: targetOpts,
      source: sourceOpts,
    }));

    const md = new MarkdownIt({
      html: true,
      // linkify: true,
      // typographer: true,
    });
    await (promiseFall(initPlugins, "init")(md));
    const contents = await renderHtml(files, sourceDir, tempDir.path, options, md, initPlugins);
    await (promiseFall(initPlugins, "after")(contents));

    log("contents", contents);
    await writeFiles(contents);
    const processed = contents.reduce((s, c) => {
      s += c.content;
      s += "<div style=\"page-break-after: always;\"></div>";
      return s;
    }, "");
    const header = await createThemeHeader(tempDir.path);
    log("header", header);
    const fileData = `<html><head>${header}</head><body>${processed}</body></html>`;
    await writeFileAsync(renderFile, fileData, "utf8");

    const params = {
      output: outputFile,
      renderFile,
      targetDir: targetOpts.dir,
      options: options.options,
    };
    switch (options.renderer) {
      case "html":
        await htmlRenderer(params);
        break;
      // case "wkhtmltopdf":
      //   await wkHtmlPdfRenderer(params);
      //   break;
      case "pandoc":
        await pandocRenderer(params);
        break;
      case "puppeteer":
        await puppeteerRenderer(params);
        break;
      default:
        throw new Error(`Unknown Renderer ${options.renderer}`);
    }
    await (promiseFall(initPlugins, "end")(contents));
  } catch (e) {
    log("err", e);
  }
  if (tempDir) {
    tempDir.unlink();
  }
}
