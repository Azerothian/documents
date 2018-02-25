import path from "path";
import debug from "debug";
import pandoc from "../utils/pandoc";

const log = debug("documents::renderer:pandoc:");
export default async function pandocRenderer({renderFile, output}) {
  const src = [renderFile, "-o", output, "-f", "html"];
  const a = src;
  log("args", a);
  await pandoc(a, {
    cwd: path.dirname(renderFile),
  });
}
