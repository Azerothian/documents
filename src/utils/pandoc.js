

import {spawn} from "child_process";


export default function exec(args) {
  return new Promise((resolve, reject) => {
    let result;
    const onData = (data) =>{
      result += data;
    };
    const onEnd = () => {
      return resolve(result || true);
    };
    const onError = (err) => {
      return reject(new Error(err));
    };
    const proc = spawn("pandoc", args);
    proc.stdout.on("data", onData);
    proc.stdout.on("end", onEnd);
    proc.stderr.on("data", onError);
  });
}
