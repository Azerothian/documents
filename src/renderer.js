
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
import wkHtmlPdfRenderer from "./renderers/wkhtmltopdf";
import puppeteerRenderer from "./renderers/puppeteer";

import promiseFall from "./utils/promise-fall";


import PuppetPlugin from "./plugins/puppet";
import MarkdownItPlugin from "./plugins/markdown-it";



const tempfsMkdir = util.promisify(tempfs.mkdir);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const ensureDirAsync = util.promisify(fs.ensureDir);

const plugins = [PuppetPlugin, MarkdownItPlugin];

const log = debug("documents::renderer:");

const tempDirOptions = {
  dir: ".",
  recursive: true,
  track: true,
};


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
      await ensureDirAsync(path.dirname(c.outputTarget));
    }
    await writeFileAsync(c.outputTarget, c.content, "utf8");
  }));
}

export default async function renderer(opts) {
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
  const tempDir = await tempfsMkdir(tempDirOptions);
  await copyAll(sourceDir, tempDir.path);
  const files = await extractFiles(options);
  const initPlugins = plugins.map((Plugin) => new Plugin({sourceDir}));
  // log("files", files);
  const md = new MarkdownIt();
  await (promiseFall(initPlugins, "init")(md));
  const contents = await renderHtml(files, sourceDir, tempDir.path, options, md, initPlugins);
  await (promiseFall(initPlugins, "after")(contents));

  log("contents", contents);
  await writeFiles(contents);
  const params = {
    contents,
    output: outputFile,
    options,
    tempDirPath: tempDir.path,
    sourceDir,
  };
  switch (options.renderer) {
    case "wkhtmltopdf":
      await wkHtmlPdfRenderer(params);
      break;
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
  tempDir.unlink();
}
