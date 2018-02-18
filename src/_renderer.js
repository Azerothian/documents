
import util from "util";
// import marked from "marked";
import globby from "globby";
import debug from "debug";
import path from "path";
import fs from "fs-extra";
import tempfs from "temp-fs";
import fm from "front-matter";
import pandoc from "./pandoc";

import markdownIt from "markdown-it";

// marked.setOptions({
//   renderer: new marked.Renderer(),
//   gfm: true,
//   tables: true,
//   breaks: true,
//   pedantic: false,
//   sanitize: false,
//   smartLists: true,
//   smartypants: false,
//   xhtml: false,
// });

// const markedAsync = util.promisify(marked);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const tempfsMkdir = util.promisify(tempfs.mkdir);
const ensureDirAsync = util.promisify(fs.ensureDir);
const log = debug("documents:index");
const copyFileAsync = util.promisify(fs.copyFile);


async function copyAll(src, dest) {
  // log("outpu", {src, dest});
  const files = await globby(["**/*", "!**/*.md"], {
    cwd: src,
  });
  // log("outpu", files);
  return Promise.all(files.map(async(f) => {
    log("t", path.dirname(f));
    if (f !== ".") {
      await ensureDirAsync(path.resolve(dest, path.dirname(f)));
    }
    const from = path.resolve(src, f);
    const to = path.resolve(dest, f);
    log("copy", {from, to});
    return copyFileAsync(from, to);
  }));
}

export default async function renderer(options) {
  log("options", options);
  const {targetDir, files, output} = options;
  const cwd = targetDir;
  let targetFiles = [];
  if (typeof files === "string") {
    targetFiles = await globby(files, {
      cwd,
    });
  } else {
    targetFiles = files;
  }
  const tempDir = await tempfsMkdir({
    dir: ".",
    recursive: true,
    track: true,
  });
  await copyAll(targetDir, tempDir.path);
  log("targetFiles", targetFiles);
  const contents = await Promise.all(targetFiles.map(async(file) => {
    const fileData = await readFileAsync(path.resolve(cwd, file), {encoding: "utf8"});
    const fmExtract = fm(fileData);
    const outputTarget =  path.resolve(tempDir.path, path.dirname(file), `${path.basename(file, path.extname(file))}.html`);
    return {
      path: file,
      content: markdownIt.render(fmExtract.body),
      header: fmExtract.attributes,
      outputTarget,
    };
  }));
  log("files", {contents});
  await Promise.all(contents.map(async(c) => {
    log("writing file", c.outputTarget);
    if (path.dirname(c.path) !== ".") {
      await ensureDirAsync(path.dirname(c.outputTarget));
    }
    await writeFileAsync(c.outputTarget, c.content, "utf8");
  }));
  const src = contents.reduce((a, v) => {
    a.push(v.outputTarget);
    return a;
  }, ["-o", output, "-f", "html"]);
  const a = src;
  log("args", a);
  await pandoc(a);

  tempDir.unlink();
}

//<div style="page-break-after: always;">
