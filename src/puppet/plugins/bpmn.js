export default {
  name: "bpmn",
  html() {
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
      <script>
        window.render = function(options) {
          return new Promise((resolve, reject) => {
            try {
              var viewer = new window.BpmnJS({
                container: "#canvas",
              });
              return viewer.importXML(options.contents, (err) => {
                if (!err) {
                  viewer.get("canvas").zoom("fit-viewport");
                  return resolve();
                } else {
                  return reject(err);
                }
              });
            } catch (e) {
              return reject(e);
            }
            return undefined;
          });
        }
      </script>
      </body>
      </html>
      `;
  }
};
