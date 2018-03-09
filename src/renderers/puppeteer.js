
import util from "util";
import path from "path";
import debug from "debug";
import puppeteer from "puppeteer";
import fs from "fs";

const readFileAsync = util.promisify(fs.readFile);
const log = debug("documents::renderers:puppeteer:");



export default async function puppeteerRenderer({renderFile, output, options}) {
  log("launching puppet", renderFile);
  const browser = await puppeteer.launch();
  try {
    let {header, footer, ...o} = options || {};
    if (header || footer) {
      o.displayHeaderFooter = true;
      if (header) {
        o.headerTemplate = await readFileAsync(path.resolve(path.dirname(renderFile), `./theme/${header}`), {encoding: "utf8"});
      }
      if (footer) {
        o.footerTemplate = await readFileAsync(path.resolve(path.dirname(renderFile), `./theme/${footer}`), {encoding: "utf8"});
      }
    }

    const page = await browser.newPage();
    log("loading file", renderFile);
    await page.goto(`file://${renderFile}`, {waitUntil: "networkidle2"});
    const opts = Object.assign({path: output, format: "A4"}, o);
    log("calling pdf", opts);
    await page.pdf(opts);
    await browser.close();
  } catch (e) {
    log("error", e);
    await browser.close();
    throw e;
  }

  // const renderer
  return "";
}
