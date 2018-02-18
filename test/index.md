# Hello

## This is a test

@bpmn("./files/temp.bpmn")

```javascript
  import util from "util";
  import fs from "fs-extra";
  import globby from "globby";
  import path from "path";
  import debug from "debug";
  const copyFileAsync = util.promisify(fs.copyFile);
  const ensureDirAsync = util.promisify(fs.ensureDir);
  const log = debug("documents::utils:copy-all:");

  export default async function copyAll(src, dest) {
    const files = await globby(["**/*", "!**/*.md"], {
      cwd: src,
    });
    return Promise.all(files.map(async(f) => {
      // log("t", path.dirname(f));
      if (f !== ".") {
        await ensureDirAsync(path.resolve(dest, path.dirname(f)));
      }
      const from = path.resolve(src, f);
      const to = path.resolve(dest, f);
      log("copy", {from, to});
      return copyFileAsync(from, to);
    }));
  }
```

@bpmn("./files/pizza-collaboration.bpmn", {"viewport": {"width": 1920, "height": 800}})

- no wai
- rofl