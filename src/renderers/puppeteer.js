
import util from "util";
import path from "path";
import debug from "debug";
import puppeteer from "puppeteer";
import fs from "fs-extra";
import globby from "globby";

const writeFileAsync = util.promisify(fs.writeFile);
const log = debug("documents::renderers:puppeteer:");


async function createThemeHeader(theme, tempDirPath) {
  const themeItems = await globby("./theme/**/*", {
    cwd: tempDirPath,
  });
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


export default async function puppeteerRenderer({contents, output, options, tempDirPath, sourceDir}) {
  const tempFile = path.resolve(tempDirPath, "__tmp.html");
  const processed = contents.reduce((s, c) => {
    s += c.content;
    s += "<div style=\"page-break-after: always;\"></div>";
    return s;
  }, "");
  const header = await createThemeHeader(options.theme, tempDirPath);
  log("header", header);
  const fileData = `<html><head>${header}</head><body>${processed}</body></html>`;
  await writeFileAsync(tempFile, fileData, "utf8");
  log("launching puppet", tempFile);
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    log("loading file", tempFile);
    await page.goto(tempFile, {waitUntil: "networkidle2"});
    log("calling pdf", output);
    await page.pdf({path: output, format: "A4"});
    await browser.close();
  } catch (e) {
    log("error", e);
    await browser.close();
    throw e;
  }

  // const renderer
  return "";
}
