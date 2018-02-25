

import {spawn} from "child_process";
import debug from "debug";
import path from "path";
const log = debug("documents::utils:pandoc:");


export default function exec(args, options) {
  return new Promise((resolve, reject) => {
    try {
      let result;
      const onData = (data) =>{
        result += data;
      };
      const onEnd = () => {
        return resolve(result || true);
      };
      const onError = (err) => {
        log("err", err.toString());
        return reject(err.toString());
      };
      const proc = spawn("pandoc", args, options);
      proc.stdout.on("data", onData);
      proc.stdout.on("end", onEnd);
      proc.stderr.on("data", onError);
      
      return undefined;
    } catch (ex) {
      log("ex", ex);
      return reject(ex);
    }
  });
}
