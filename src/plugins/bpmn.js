
import util from "util";
import debug from "debug";
import path from "path";

import puppeteer from "puppeteer";

import fs from "fs";
// import bpmnJs from "bpmn-js";

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

// .bjs-powered-by {
//   display: none;
// }
const log = debug("documents::plugins:bpmn:");
function renderHtml(bpmnData) {
  return `<html>
  <head>
  <style>

  </style>
  <link rel="stylesheet" href="https://unpkg.com/bpmn-js@0.27.2/dist/assets/diagram-js.css" />
  <link rel="stylesheet" href="https://unpkg.com/bpmn-js@0.27.2/dist/assets/bpmn-font/css/bpmn.css" />
  <script src="https://unpkg.com/bpmn-js@0.27.2/dist/bpmn-viewer.development.js"></script>
  </head>
  <body>
  <div id="canvas"></div>
  </body>
  </html>
  `;
}


// const reg = /(\@bpmn\(")(.*)("\))/g;

export default async function bpmlPlugin({fileData, projectDir}) {
  const matches = fileData.match(/(\@bpmn\(")(.*)(",|"\))(.*)/g);
  if (matches) {
    return matches.reduce(async(promise, m) => {
      return promise.then(async(data) => {
        const o = /(\@bpmn\(")(.*)(",|"\))(.*)/g.exec(m);
        log("exec", o);
        const filePath = o[2];
        let params = {};
        if (o[4].indexOf(")") > -1) {
          params = JSON.parse(o[4].replace(")", ""));
        }
        const targetFile = path.resolve(projectDir, filePath);
        const bpmnData = await readFileAsync(targetFile, {encoding: "utf8"});
        const htmlData = renderHtml(bpmnData);
        const projectFilePath = path.resolve(path.dirname(targetFile), path.basename(targetFile, path.extname(targetFile)));
        const projectOutput = `${projectFilePath}.png`;
        await writeFileAsync(`${projectFilePath}.html`, htmlData, "utf8");
        const browser = await puppeteer.launch();
        try {
          const page = await browser.newPage();
          if (params.viewport) {
            page.setViewport(params.viewport);
          }
          log("loading file", `${projectFilePath}.html`);
          await page.goto(`file://${projectFilePath}.html`, {waitUntil: "networkidle2"});
          await page.evaluate((bpmnData) => {
            return new Promise((resolve, reject) => {
              try {
                var viewer = new window.BpmnJS({
                  container: "#canvas",
                });
                viewer.importXML(bpmnData, (err) => {
                  if (!err) {
                    viewer.get("canvas").zoom("fit-viewport");
                    return resolve();
                  } else {
                    document.getElementById("canvas").textContent(JSON.stringify(err));
                    return reject(err);
                  }
                });
              } catch (e) {
                return reject(e);
              }
              return undefined;
            });
          }, bpmnData);
          log("calling screenshot", projectOutput);
          await page.screenshot({
            path: projectOutput,
            omitBackground: true,
            fullPage: true,
          });
          await browser.close();
        } catch (e) {
          log("error", e);
          await browser.close();
          throw e;
        }
        return data.replace(m, `![](${projectOutput.replace(/(\\)/g, "/")})`);
      });
    }, Promise.resolve(fileData));
  }
  // const output = .exec(fileData);
  // log("regex output", output);

  return fileData;
}
