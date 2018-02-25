

import MarkdownItContainer from "markdown-it-container";


// const elements = {
//   "grid": "container",
//   "row": "row",
//   "col": "col",
// };

export default class BootstrapPlugin {
  init(md) {
    md.use(MarkdownItContainer, "container");
    md.use(MarkdownItContainer, "row");
    // md.use(MarkdownItContainer, "row", {
    //   validate(params) {
    //     return params.trim().match(/^row\s+(.*)$/);
    //   },
    //   render(tokens, idx) {
    //     var m = tokens[idx].info.trim().match(/^row\s+(.*)$/);
    //     if (tokens[idx].nesting === 1) {
    //       return `<div class="row">${m[1]}</div>\n`;
    //     } else {
    //       return "</div>\n";
    //     }
    //   }
    // });
    // md.use(MarkdownItContainer, "col", {
    //   validate(params) {
    //     return params.trim().match(/^col\s+(.*)$/);
    //   },
    //   render(tokens, idx) {
    //     var m = tokens[idx].info.trim().match(/^col\s+(.*)$/);
    //     if (tokens[idx].nesting === 1) {
    //       return `<div class="col">${m[1]}</div>\n`;
    //     } else {
    //       return "</div>\n";
    //     }
    //   }
    // });
  }
}
