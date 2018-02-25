
// import util from "util";
// import path from "path";
import debug from "debug";
import puppeteer from "puppeteer";
// import fs from "fs-extra";
// import globby from "globby";

// const writeFileAsync = util.promisify(fs.writeFile);
const log = debug("documents::renderers:puppeteer:");



export default async function puppeteerRenderer({renderFile, output}) {
  log("launching puppet", renderFile);
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    log("loading file", renderFile);
    await page.goto(`file://${renderFile}`, {waitUntil: "networkidle2"});
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
