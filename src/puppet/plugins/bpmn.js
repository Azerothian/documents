export default {
  name: "bpmn",
  html({style}) {
    return `<html>
      <head>
      <style>
        ${style};
      </style>
      <link rel="stylesheet" href="https://unpkg.com/bpmn-js@0.27.2/dist/assets/diagram-js.css" />
      <link rel="stylesheet" href="https://unpkg.com/bpmn-js@0.27.2/dist/assets/bpmn-font/css/bpmn.css" />
      <script src="https://unpkg.com/bpmn-js@0.27.2/dist/bpmn-viewer.development.js"></script>
      <style>
        body, html {
          padding: 0;
          margin: 0;
        }
        #canvas {
          width: 100%;
          height: 100vh;
        }
      </style>
      </head>
      <body>
      <div id="canvas"></div>
      <script>
        window.render = function(options) {
          return new Promise((resolve, reject) => {
            try {
              var viewer = new window.BpmnJS({
                container: "#canvas",
                width: window.innerWidth,
                height: window.innerHeight,
              });
              return viewer.importXML(options.contents, (err) => {
                if (!err) {
                  viewer.get("canvas").zoom("fit-viewport");
                  return resolve();
                  // return viewer.saveSVG((err, svg) => {
                  //   if(!err) {
                  //     document.getElementById("canvas").innerHtml = svg;
                  //     return resolve();
                  //   }
                  //   return reject(err);
                  // });
                  
                }
                return reject(err);
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
