import renderer from "../renderer";
// import url from "url";
// import path from "path";
// import fs from "fs";
import debug from "debug";
debug.enable("documents:*,puppeteer:console*");

test("puppeteer", async() => {
  await renderer("./test/index-puppeteer.json");
}, 40000);
test("html", async() => {
  await renderer("./test/index-html.json");
}, 40000);
test("pandoc docx", async() => {
  await renderer("./test/index-pandoc.json");
}, 40000);
// test("wkhtmltopdf", async() => {
//   await renderer("./test/index.wkhtmltopdf.json");
// });
