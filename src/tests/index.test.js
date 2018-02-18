import renderer from "../renderer";
// import url from "url";
// import path from "path";
// import fs from "fs";
import debug from "debug";
debug.enable("documents:*");

test("puppeteer", async() => {
  await renderer("./test/index.puppeteer.json");
}, 20000);
test("pandoc docx", async() => {
  await renderer("./test/index.pandoc-docx.json");
});
// test("wkhtmltopdf", async() => {
//   await renderer("./test/index.wkhtmltopdf.json");
// });
