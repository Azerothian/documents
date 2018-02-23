export default function promiseFall(arr, functionName, passThrough = false) {
  return function() {
    const start = [].slice.call(arguments);
    return arr.reduce((promise, component) => {
      return promise.then(function() {
        let args = start;
        if (passThrough) {
          args = [].slice.call(arguments);
        }
        if (component[functionName]) {
          return component[functionName].apply(component, args);
        }
        return Promise.resolve.apply(Promise, args);

      });
    }, Promise.resolve.apply(Promise, start));
  };
}

