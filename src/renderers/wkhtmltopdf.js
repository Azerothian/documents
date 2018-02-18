
import util from "util";
import path from "path";
import debug from "debug";
import wkhtmltopdf from "wkhtmltopdf";
wkhtmltopdf.command = "C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltopdf.exe";
import fs from "fs-extra";

const writeFileAsync = util.promisify(fs.writeFile);
const wkhtmltopdfAsync = util.promisify(wkhtmltopdf);
const log = debug("documents::renderers:wkhtmltopdf:");

export default async function wkhtmltopdfRenderer({contents, output, options, tempDirPath}) {
  const tempFile = path.resolve(tempDirPath, "__tmp.html");
  log("target", tempFile);
  await writeFileAsync(tempFile, contents.reduce((s, c) => {
    s += c.content;
    s += "<div style=\"page-break-after: always;\"></div>";
    return s;
  }, ""), "utf8");
  await wkhtmltopdfAsync(fs.createReadStream(tempFile), Object.assign({
    output,
  }, options.renderOptions));

  // const renderer
  return "";
}
