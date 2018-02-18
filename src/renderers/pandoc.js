
import debug from "debug";
import pandoc from "../utils/pandoc";

const log = debug("documents::renderer:pandoc:");
export default async function pandocRenderer({contents, output, options, tempDirPath}) {
  const src = contents.reduce((a, v) => {
    a.push(v.outputTarget);
    return a;
  }, ["-o", output, "-f", "html"]);
  const a = src;
  log("args", a);
  await pandoc(a);
}
